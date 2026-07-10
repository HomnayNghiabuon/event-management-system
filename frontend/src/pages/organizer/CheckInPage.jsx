import { useState, useRef, useEffect, useCallback } from 'react'
import jsQR from 'jsqr'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { checkin } from '../../api/tickets'
import { QrCode, CheckCircle, XCircle, Loader2, Search, Camera, CameraOff } from 'lucide-react'

export function CheckInPage() {
  const [mode, setMode] = useState('manual') // 'manual' | 'camera'
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [cameraError, setCameraError] = useState('')
  const [scanning, setScanning] = useState(false)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const cooldownRef = useRef(false)

  const doCheckin = useCallback(async (code) => {
    if (!code.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const data = await checkin(code.trim())
      setResult({ success: data.success, message: data.message, attendeeName: data.attendeeName, checkinTime: data.checkinTime })
      setHistory((h) => [{ qrCode: code.trim(), ...data, time: new Date() }, ...h.slice(0, 9)])
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Lỗi kiểm tra vé'
      setResult({ success: false, message: msg })
    } finally {
      setLoading(false)
    }
  }, [loading])

  const handleManualSubmit = (e) => {
    e.preventDefault()
    doCheckin(qrCode)
    setQrCode('')
  }

  // ── Camera logic ────────────────────────────────────────────

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code && !cooldownRef.current && !loading) {
      cooldownRef.current = true
      doCheckin(code.data)
      // Cooldown 2s để tránh scan liên tục cùng 1 vé
      setTimeout(() => { cooldownRef.current = false }, 2000)
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [doCheckin, loading])

  const startCamera = useCallback(async () => {
    setCameraError('')
    setScanning(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setScanning(true)
          rafRef.current = requestAnimationFrame(scanFrame)
        }
      }
    } catch (err) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Trình duyệt bị từ chối quyền truy cập camera. Hãy cấp quyền và thử lại.'
          : 'Không thể mở camera: ' + err.message
      )
    }
  }, [scanFrame])

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [mode]) // eslint-disable-line

  // Restart scanFrame loop when loading changes (after API returns)
  useEffect(() => {
    if (mode === 'camera' && scanning && !loading) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(scanFrame)
    }
  }, [loading]) // eslint-disable-line

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Check-in người tham dự</h1>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
              mode === 'manual'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-500 hover:border-purple-300 bg-white'
            }`}
          >
            <Search className="w-4 h-4" /> Nhập mã thủ công
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
              mode === 'camera'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 text-gray-500 hover:border-purple-300 bg-white'
            }`}
          >
            <Camera className="w-4 h-4" /> Quét camera
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          {mode === 'manual' ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Nhập mã QR</h2>
                  <p className="text-sm text-gray-500">Dùng máy quét hoặc nhập trực tiếp</p>
                </div>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Nhập hoặc quét QR code..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-base font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !qrCode.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang kiểm tra...</> : <><QrCode className="w-5 h-5" /> Check-in</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quét QR bằng camera</h2>
                  <p className="text-sm text-gray-500">Hướng camera vào mã QR trên vé</p>
                </div>
              </div>

              {/* Camera viewport */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning overlay */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-56 h-56">
                      {/* Corner brackets */}
                      <span className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                      <span className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                      <span className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                      <span className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-400 rounded-br-lg" />
                      {/* Scanning line */}
                      <div className="absolute inset-x-2 top-1/2 h-0.5 bg-green-400 opacity-80 animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Loading overlay during API call */}
                {loading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                    <p className="text-white font-medium">Đang kiểm tra vé...</p>
                  </div>
                )}

                {/* Not scanning state */}
                {!scanning && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="opacity-70">Đang khởi động camera...</p>
                    </div>
                  </div>
                )}

                {/* Camera error */}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center">
                      <CameraOff className="w-16 h-16 text-red-400 mx-auto mb-3" />
                      <p className="text-white text-sm">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="mt-4 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100"
                      >
                        Thử lại
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {scanning && (
                <p className="text-center text-sm text-gray-500">
                  Tự động check-in khi phát hiện mã QR hợp lệ
                </p>
              )}
            </>
          )}

          {/* Result */}
          {result && (
            <div className={`mt-6 p-5 rounded-xl border-2 ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                {result.success
                  ? <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                  : <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />}
                <div>
                  <p className={`font-bold text-lg ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.success ? 'Check-in thành công!' : 'Check-in thất bại'}
                  </p>
                  <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>{result.message}</p>
                </div>
              </div>
              {result.attendeeName && <p className="text-sm text-gray-700 ml-11">Người tham dự: <strong>{result.attendeeName}</strong></p>}
              {result.checkinTime && <p className="text-xs text-gray-500 ml-11 mt-1">Thời gian: {new Date(result.checkinTime).toLocaleString('vi-VN')}</p>}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Lịch sử check-in ({history.length})</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${h.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  {h.success
                    ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{h.attendeeName || h.qrCode}</p>
                    <p className="text-xs text-gray-500">{h.time.toLocaleTimeString('vi-VN')} · {h.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

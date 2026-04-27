import { useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { checkin } from '../../api/tickets'
import { QrCode, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'

export function CheckInPage() {
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const handleCheckin = async (e) => {
    e.preventDefault()
    if (!qrCode.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const data = await checkin(qrCode.trim())
      setResult({ success: data.success, message: data.message, attendeeName: data.attendeeName, checkinTime: data.checkinTime })
      setHistory((h) => [{ qrCode: qrCode.trim(), ...data, time: new Date() }, ...h.slice(0, 9)])
      if (data.success) setQrCode('')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Lỗi kiểm tra vé'
      setResult({ success: false, message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Check-in người tham dự</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Nhập mã QR</h2>
              <p className="text-sm text-gray-500">Quét hoặc nhập QR code của vé</p>
            </div>
          </div>

          <form onSubmit={handleCheckin} className="space-y-4">
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
            <button type="submit" disabled={loading || !qrCode.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang kiểm tra...</> : <><QrCode className="w-5 h-5" /> Check-in</>}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-5 rounded-xl border-2 ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                {result.success
                  ? <CheckCircle className="w-8 h-8 text-green-600" />
                  : <XCircle className="w-8 h-8 text-red-600" />}
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
            <h3 className="text-base font-semibold text-gray-900 mb-4">Lịch sử check-in gần đây</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${h.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  {h.success ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
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

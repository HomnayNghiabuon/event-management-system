import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getTicketById, fetchQrImage } from '../../api/tickets'
import {
  ArrowLeft, QrCode, CheckCircle, XCircle, Calendar, MapPin,
  Tag, User, Download, Loader2, Hash, ShoppingBag, Clock, Navigation,
} from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qrBlobUrl, setQrBlobUrl] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const blobUrlRef = useRef(null)

  useEffect(() => {
    getTicketById(ticketId)
      .then(setTicket)
      .catch(() => setError('Không tìm thấy vé'))
      .finally(() => setLoading(false))
  }, [ticketId])

  useEffect(() => {
    if (!ticket?.qrCode || !ticket?.isValid) return
    setQrLoading(true)
    fetchQrImage(ticket.qrCode)
      .then((url) => {
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = url
        setQrBlobUrl(url)
      })
      .catch(() => setQrBlobUrl(null))
      .finally(() => setQrLoading(false))
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [ticket])

  const downloadTicket = async () => {
    if (!ticket) return
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 700
      canvas.height = 280
      const ctx = canvas.getContext('2d')

      const grad = ctx.createLinearGradient(0, 0, 700, 280)
      grad.addColorStop(0, '#4F46E5')
      grad.addColorStop(1, '#7C3AED')
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.roundRect(0, 0, 700, 280, 16); ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath(); ctx.roundRect(16, 16, 440, 248, 12); ctx.fill()

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.beginPath(); ctx.roundRect(472, 16, 212, 248, 12); ctx.fill()

      ctx.fillStyle = '#7C3AED'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('BuyTicket', 32, 48)

      ctx.fillStyle = '#111827'
      ctx.font = 'bold 16px sans-serif'
      const title = ticket.eventTitle || 'Sự kiện'
      let titleText = title
      while (ctx.measureText(titleText).width > 400 && titleText.length > 10) {
        titleText = titleText.slice(0, -1)
      }
      if (titleText !== title) titleText += '…'
      ctx.fillText(titleText, 32, 80)

      ctx.fillStyle = '#EDE9FE'
      ctx.beginPath(); ctx.roundRect(32, 92, ctx.measureText(ticket.ticketTypeName || '').width + 20, 26, 8); ctx.fill()
      ctx.fillStyle = '#6D28D9'
      ctx.font = '13px sans-serif'
      ctx.fillText(ticket.ticketTypeName || '', 42, 110)

      ctx.fillStyle = '#6B7280'
      ctx.font = '12px sans-serif'
      ctx.fillText('Người tham dự', 32, 148)
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 15px sans-serif'
      ctx.fillText(ticket.attendeeName || '', 32, 168)

      ctx.fillStyle = '#6B7280'
      ctx.font = '11px sans-serif'
      ctx.fillText(`Mã vé: #${ticket.ticketId}`, 32, 200)

      const statusColor = ticket.checkinStatus ? '#059669' : '#2563EB'
      const statusText = ticket.checkinStatus ? 'Đã check-in' : 'Hợp lệ'
      ctx.fillStyle = ticket.checkinStatus ? '#D1FAE5' : '#DBEAFE'
      ctx.beginPath(); ctx.roundRect(32, 212, 110, 28, 8); ctx.fill()
      ctx.fillStyle = statusColor
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(statusText, 42, 231)

      ctx.setLineDash([6, 4])
      ctx.strokeStyle = '#E5E7EB'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(460, 32); ctx.lineTo(460, 248); ctx.stroke()
      ctx.setLineDash([])

      if (qrBlobUrl) {
        await new Promise((resolve) => {
          const img = new Image()
          img.onload = () => { ctx.drawImage(img, 488, 36, 180, 180); resolve() }
          img.onerror = resolve
          img.src = qrBlobUrl
        })
      }

      ctx.fillStyle = '#ffffff'
      ctx.font = '11px monospace'
      const qrLabel = ticket.qrCode.length > 20 ? ticket.qrCode.slice(0, 20) + '…' : ticket.qrCode
      const labelW = ctx.measureText(qrLabel).width
      ctx.fillText(qrLabel, 472 + (212 - labelW) / 2, 238)

      const link = document.createElement('a')
      link.download = `ticket-${ticket.ticketId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1"><LoadingSpinner /></div><Footer /></div>

  if (error || !ticket) return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy vé'}</p>
          <Link to="/my-tickets" className="text-purple-600 hover:underline">← Quay lại danh sách vé</Link>
        </div>
      </main>
      <Footer />
    </div>
  )

  const statusBadge = ticket.isValid
    ? ticket.checkinStatus
      ? { text: 'Đã check-in', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> }
      : { text: 'Hợp lệ', cls: 'bg-blue-100 text-blue-700', icon: <QrCode className="w-4 h-4" /> }
    : { text: 'Đã hủy', cls: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back nav */}
        <div className="mb-6">
          <Link to="/my-tickets" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại vé của tôi
          </Link>
        </div>

        {/* Event banner */}
        {ticket.eventThumbnail && (
          <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-md">
            <img src={ticket.eventThumbnail} alt={ticket.eventTitle} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Ticket card */}
        <div className={`bg-white rounded-2xl shadow-md overflow-hidden border-l-4 ${ticket.isValid ? 'border-purple-500' : 'border-gray-300'}`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs font-medium mb-1">SỰ KIỆN</p>
                <h1 className="text-white font-bold text-lg leading-tight">{ticket.eventTitle}</h1>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge.cls}`}>
                {statusBadge.icon}{statusBadge.text}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ticket.eventDate && (
                <InfoRow icon={<Calendar className="w-4 h-4 text-purple-500" />} label="Ngày tổ chức">
                  {new Date(ticket.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </InfoRow>
              )}
              {(ticket.startTime || ticket.endTime) && (
                <InfoRow icon={<Clock className="w-4 h-4 text-purple-500" />} label="Thời gian">
                  {ticket.startTime && ticket.startTime.substring(0, 5)}
                  {ticket.endTime && <span className="text-gray-500"> – {ticket.endTime.substring(0, 5)}</span>}
                </InfoRow>
              )}
              {ticket.eventLocation && (
                <InfoRow icon={<MapPin className="w-4 h-4 text-purple-500" />} label="Địa điểm">
                  {ticket.eventLocation}
                </InfoRow>
              )}
              <InfoRow icon={<Tag className="w-4 h-4 text-purple-500" />} label="Loại vé">
                {ticket.ticketTypeName}
                {ticket.unitPrice != null && (
                  <span className="ml-2 text-purple-600 font-semibold">{VND.format(ticket.unitPrice)}</span>
                )}
              </InfoRow>
              <InfoRow icon={<User className="w-4 h-4 text-purple-500" />} label="Người tham dự">
                {ticket.attendeeName}
              </InfoRow>
              <InfoRow icon={<Hash className="w-4 h-4 text-purple-500" />} label="Mã vé">
                #{ticket.ticketId}
              </InfoRow>
              {ticket.orderId && (
                <InfoRow icon={<ShoppingBag className="w-4 h-4 text-purple-500" />} label="Đơn hàng">
                  <Link to={`/my-orders/${ticket.orderId}`} className="text-purple-600 hover:underline font-medium">
                    Đơn #{ticket.orderId}
                  </Link>
                </InfoRow>
              )}
            </div>

            {/* Map */}
            {ticket.latitude && ticket.longitude && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-purple-500" /> Vị trí sự kiện
                </p>
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <MapContainer
                    center={[ticket.latitude, ticket.longitude]}
                    zoom={15}
                    style={{ height: '220px', width: '100%' }}
                    scrollWheelZoom={false}
                    zoomControl={true}
                    attributionControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[ticket.latitude, ticket.longitude]} />
                  </MapContainer>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${ticket.latitude},${ticket.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" /> Xem đường đi trên Google Maps
                </a>
              </div>
            )}

            {ticket.checkinStatus && ticket.checkinTime && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Check-in lúc {new Date(ticket.checkinTime).toLocaleString('vi-VN')}</span>
              </div>
            )}

            {!ticket.isValid && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-xl px-4 py-3 text-sm">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                <span>Vé đã bị hủy và không còn hiệu lực</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200" />

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-gray-600">Mã QR check-in</p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center min-h-[200px] w-full max-w-xs mx-auto">
                {!ticket.isValid ? (
                  <div className="text-center text-gray-400">
                    <XCircle className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Vé không hợp lệ</p>
                  </div>
                ) : qrLoading ? (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="text-sm">Đang tải QR...</p>
                  </div>
                ) : qrBlobUrl ? (
                  <img src={qrBlobUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="text-center text-gray-400">
                    <QrCode className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-xs">Không thể tải QR</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono break-all text-center px-2">{ticket.qrCode}</p>
            </div>

            {/* Actions */}
            {ticket.isValid && (
              <button
                onClick={downloadTicket}
                disabled={downloading || qrLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Tải xuống vé
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800">{children}</p>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMyTickets, fetchQrImage } from '../../api/tickets'
import { QrCode, CheckCircle, XCircle, Ticket, Loader2, Download } from 'lucide-react'

export function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQr, setSelectedQr] = useState(null)
  const [qrBlobUrl, setQrBlobUrl] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const blobUrlRef = useRef(null)

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedQr) return
    setQrBlobUrl(null)
    setQrLoading(true)
    fetchQrImage(selectedQr.qrCode)
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
  }, [selectedQr])

  const downloadTicket = async () => {
    const ticket = selectedQr
    const canvas = document.createElement('canvas')
    canvas.width = 700
    canvas.height = 280
    const ctx = canvas.getContext('2d')

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 700, 280)
    grad.addColorStop(0, '#4F46E5')
    grad.addColorStop(1, '#7C3AED')
    ctx.fillStyle = grad
    ctx.beginPath(); ctx.roundRect(0, 0, 700, 280, 16); ctx.fill()

    // White content area (left)
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.roundRect(16, 16, 440, 248, 12); ctx.fill()

    // Right strip (QR area)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.beginPath(); ctx.roundRect(472, 16, 212, 248, 12); ctx.fill()

    // Brand
    ctx.fillStyle = '#7C3AED'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('BuyTicket', 32, 48)

    // Event title
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 16px sans-serif'
    const title = ticket.eventTitle || 'Sự kiện'
    const maxW = 400
    let titleText = title
    while (ctx.measureText(titleText).width > maxW && titleText.length > 10) {
      titleText = titleText.slice(0, -1)
    }
    if (titleText !== title) titleText += '…'
    ctx.fillText(titleText, 32, 80)

    // Ticket type badge
    ctx.fillStyle = '#EDE9FE'
    ctx.beginPath(); ctx.roundRect(32, 92, ctx.measureText(ticket.ticketTypeName || '').width + 20, 26, 8); ctx.fill()
    ctx.fillStyle = '#6D28D9'
    ctx.font = '13px sans-serif'
    ctx.fillText(ticket.ticketTypeName || '', 42, 110)

    // Attendee label + name
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px sans-serif'
    ctx.fillText('Người tham dự', 32, 148)
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 15px sans-serif'
    ctx.fillText(ticket.attendeeName || '', 32, 168)

    // Ticket ID
    ctx.fillStyle = '#6B7280'
    ctx.font = '11px sans-serif'
    ctx.fillText(`Mã vé: #${ticket.ticketId}`, 32, 200)

    // Status
    const statusColor = ticket.checkinStatus ? '#059669' : '#2563EB'
    const statusText = ticket.checkinStatus ? 'Đã check-in' : 'Hợp lệ'
    ctx.fillStyle = ticket.checkinStatus ? '#D1FAE5' : '#DBEAFE'
    ctx.beginPath(); ctx.roundRect(32, 212, 110, 28, 8); ctx.fill()
    ctx.fillStyle = statusColor
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(statusText, 42, 231)

    // Divider dashes
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(460, 32)
    ctx.lineTo(460, 248)
    ctx.stroke()
    ctx.setLineDash([])

    // QR code image
    if (qrBlobUrl) {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 488, 36, 180, 180)
          resolve()
        }
        img.onerror = resolve
        img.src = qrBlobUrl
      })
    }

    // QR label
    ctx.fillStyle = '#ffffff'
    ctx.font = '11px monospace'
    const qrLabel = ticket.qrCode.length > 20 ? ticket.qrCode.slice(0, 20) + '…' : ticket.qrCode
    const labelW = ctx.measureText(qrLabel).width
    ctx.fillText(qrLabel, 472 + (212 - labelW) / 2, 238)

    const link = document.createElement('a')
    link.download = `ticket-${ticket.ticketId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const validTickets = tickets.filter((t) => t.isValid)
  const invalidTickets = tickets.filter((t) => !t.isValid)

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Vé của tôi</h1>

        {loading ? <LoadingSpinner /> : tickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có vé nào</p>
          </div>
        ) : (
          <div className="space-y-8">
            {validTickets.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Vé hợp lệ ({validTickets.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validTickets.map((ticket) => (
                    <TicketCard key={ticket.ticketId} ticket={ticket} onShowQr={() => setSelectedQr(ticket)} />
                  ))}
                </div>
              </section>
            )}
            {invalidTickets.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-500 mb-4">Vé đã hủy ({invalidTickets.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {invalidTickets.map((ticket) => (
                    <TicketCard key={ticket.ticketId} ticket={ticket} onShowQr={null} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />

      {/* QR Modal */}
      {selectedQr && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedQr(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedQr.eventTitle}</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedQr.ticketTypeName}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 flex items-center justify-center min-h-[240px]">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-sm">Đang tải QR...</p>
                </div>
              ) : qrBlobUrl ? (
                <img src={qrBlobUrl} alt="QR Code" className="w-56 h-56 object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <QrCode className="w-16 h-16" />
                  <p className="text-xs">Không thể tải QR</p>
                  <p className="text-xs font-mono break-all px-2">{selectedQr.qrCode}</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-4 font-mono break-all">{selectedQr.qrCode}</p>
            {selectedQr.checkinStatus && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Đã check-in</span>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelectedQr(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Đóng
              </button>
              <button onClick={downloadTicket} disabled={qrLoading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="w-4 h-4" /> Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TicketCard({ ticket, onShowQr }) {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${ticket.isValid ? 'border-purple-500' : 'border-gray-300'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{ticket.eventTitle}</h3>
            <p className="text-xs text-purple-600 font-medium mt-1">{ticket.ticketTypeName}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${ticket.checkinStatus ? 'bg-green-100 text-green-700' : ticket.isValid ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            {ticket.checkinStatus
              ? <><CheckCircle className="w-3 h-3" /> Checked</>
              : ticket.isValid
              ? <><QrCode className="w-3 h-3" /> Hợp lệ</>
              : <><XCircle className="w-3 h-3" /> Đã hủy</>}
          </div>
        </div>

        {ticket.checkinTime && (
          <p className="text-xs text-gray-500 mb-3">
            Check-in: {new Date(ticket.checkinTime).toLocaleString('vi-VN')}
          </p>
        )}

        {onShowQr && (
          <button onClick={onShowQr}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4" /> Xem QR Code
          </button>
        )}
      </div>
    </div>
  )
}

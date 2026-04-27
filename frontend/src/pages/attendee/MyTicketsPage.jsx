import { useState, useEffect, useRef } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMyTickets, fetchQrImage } from '../../api/tickets'
import { QrCode, CheckCircle, XCircle, Ticket, Loader2 } from 'lucide-react'

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
            <button onClick={() => setSelectedQr(null)}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold">
              Đóng
            </button>
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

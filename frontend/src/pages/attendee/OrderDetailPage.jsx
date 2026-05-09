import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getOrderById, cancelOrder } from '../../api/orders'
import {
  ArrowLeft, Calendar, MapPin, Tag, CreditCard, Hash,
  CheckCircle, XCircle, QrCode, Loader2, AlertCircle,
} from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const STATUS_CONFIG = {
  PAID:      { text: 'Đã thanh toán', cls: 'bg-green-100 text-green-700 border-green-200' },
  PENDING:   { text: 'Chờ thanh toán', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  CANCELLED: { text: 'Đã hủy', cls: 'bg-red-100 text-red-700 border-red-200' },
}
const PM_LABEL = { MOMO: 'Ví MoMo', VNPAY: 'VNPay', CASH: 'Tiền mặt' }

export function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  useEffect(() => {
    getOrderById(orderId)
      .then(setOrder)
      .catch(() => setError('Không tìm thấy đơn hàng'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này? Hành động này không thể hoàn tác.')) return
    setCancelling(true)
    setCancelError('')
    try {
      await cancelOrder(orderId)
      const updated = await getOrderById(orderId)
      setOrder(updated)
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Không thể hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1"><LoadingSpinner /></div><Footer /></div>

  if (error || !order) return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Không tìm thấy đơn hàng'}</p>
          <Link to="/my-orders" className="text-purple-600 hover:underline">← Quay lại đơn hàng</Link>
        </div>
      </main>
      <Footer />
    </div>
  )

  const status = STATUS_CONFIG[order.paymentStatus] || { text: order.paymentStatus, cls: 'bg-gray-100 text-gray-600 border-gray-200' }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back nav */}
        <div className="mb-6">
          <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại đơn hàng
          </Link>
        </div>

        {/* Event thumbnail */}
        {order.eventThumbnail && (
          <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 shadow-md">
            <img src={order.eventThumbnail} alt={order.eventTitle} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Order header card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">ĐƠN HÀNG</p>
                <h1 className="text-white font-bold text-xl">#{order.orderId}</h1>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${status.cls}`}>
                {status.text}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Event info */}
            {order.eventTitle && (
              <div className="pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">SỰ KIỆN</p>
                <p className="font-semibold text-gray-900 text-base">{order.eventTitle}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  {order.eventDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {new Date(order.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {order.startTime && <span className="text-gray-500">lúc {order.startTime.substring(0, 5)}</span>}
                    </div>
                  )}
                  {order.eventLocation && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {order.eventLocation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order info grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Thanh toán</p>
                <p className="font-medium text-gray-800">{PM_LABEL[order.paymentMethod] || order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Ngày đặt</p>
                <p className="font-medium text-gray-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              {order.paidAt && (
                <div>
                  <p className="text-gray-500 mb-1">Ngày thanh toán</p>
                  <p className="font-medium text-gray-800">{new Date(order.paidAt).toLocaleString('vi-VN')}</p>
                </div>
              )}
              {order.transactionId && (
                <div>
                  <p className="text-gray-500 mb-1">Mã giao dịch</p>
                  <p className="font-medium text-gray-800 text-xs break-all">{order.transactionId}</p>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {order.ticketTypeName && order.unitPrice != null && order.quantity != null && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{order.ticketTypeName} × {order.quantity}</span>
                  <span>{VND.format(order.unitPrice * order.quantity)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                <span>Tổng cộng</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-lg">
                  {VND.format(order.totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets list */}
        {order.tickets && order.tickets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Danh sách vé ({order.tickets.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.tickets.map((ticket) => (
                <div key={ticket.ticketId} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ticket.checkinStatus ? 'bg-green-100' : 'bg-purple-100'}`}>
                      {ticket.checkinStatus
                        ? <CheckCircle className="w-5 h-5 text-green-600" />
                        : <QrCode className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{ticket.attendeeName}</p>
                      <p className="text-xs text-gray-400">#{ticket.ticketId}</p>
                      {ticket.checkinTime && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Check-in: {new Date(ticket.checkinTime).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ticket.checkinStatus ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ticket.checkinStatus ? 'Checked-in' : 'Chưa check-in'}
                    </span>
                    <Link
                      to={`/my-tickets/${ticket.ticketId}`}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel section */}
        {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'AWAITING_GATEWAY') && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Hủy đơn hàng</h3>
            <p className="text-sm text-gray-500 mb-4">
              Sau khi hủy, chỗ giữ sẽ được giải phóng và số lượng vé sẽ được hoàn trả. Hành động này không thể hoàn tác.
            </p>
            {cancelError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {cancelError}
              </div>
            )}
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 font-medium transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Hủy đơn hàng
            </button>
          </div>
        )}

        {order.paymentStatus === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Đơn hàng đã bị hủy</p>
              <p className="text-sm text-red-600 mt-1">Tất cả vé trong đơn hàng này đã bị vô hiệu hóa.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

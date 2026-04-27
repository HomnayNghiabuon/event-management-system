import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMyOrders, cancelOrder } from '../../api/orders'
import { ShoppingBag, Ticket, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const STATUS_LABEL = { PAID: { text: 'Đã thanh toán', cls: 'bg-green-100 text-green-700' }, PENDING: { text: 'Chờ thanh toán', cls: 'bg-yellow-100 text-yellow-700' }, CANCELLED: { text: 'Đã hủy', cls: 'bg-red-100 text-red-700' } }
const PM_LABEL = { MOMO: 'Ví MoMo', VNPAY: 'VNPay', CASH: 'Tiền mặt' }

export function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [cancelling, setCancelling] = useState(null)

  const load = () => {
    setLoading(true)
    getMyOrders(page, 10)
      .then((data) => { setOrders(data.content || []); setTotalPages(data.totalPages || 0) })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleCancel = async (orderId) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setCancelling(orderId)
    try {
      await cancelOrder(orderId)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể hủy đơn hàng')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Đơn hàng của tôi</h1>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_LABEL[order.paymentStatus] || { text: order.paymentStatus, cls: 'bg-gray-100 text-gray-600' }
              const isExpanded = expandedId === order.orderId

              return (
                <div key={order.orderId} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.orderId)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">Đơn #{order.orderId}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>{status.text}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString('vi-VN')} · {PM_LABEL[order.paymentMethod] || order.paymentMethod}
                        </p>
                        <p className="text-sm text-gray-500">{order.tickets?.length || 0} vé</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {VND.format(order.totalPrice)}
                        </p>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="w-5 h-5 text-gray-400 ml-auto mt-1" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Ticket className="w-4 h-4" /> Danh sách vé
                      </h3>
                      <div className="space-y-2">
                        {order.tickets?.map((t) => (
                          <div key={t.ticketId} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                            <span className="text-gray-700">{t.attendeeName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${t.checkinStatus ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                {t.checkinStatus ? 'Checked-in' : 'Chưa check-in'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      {order.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleCancel(order.orderId)}
                          disabled={cancelling === order.orderId}
                          className="mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                          {cancelling === order.orderId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all text-sm">
                  Trước
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-all text-sm">
                  Tiếp
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

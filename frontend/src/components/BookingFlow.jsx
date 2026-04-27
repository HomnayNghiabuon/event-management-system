import { useState } from 'react'
import { X, Plus, Minus, CheckCircle, XCircle, Ticket as TicketIcon, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { reserve, purchase } from '../api/reservations'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const PAYMENT_METHODS = [
  { value: 'MOMO', label: 'Ví MoMo', color: 'bg-pink-600', icon: 'M' },
  { value: 'VNPAY', label: 'VNPay', color: 'bg-red-600', icon: 'V' },
  { value: 'CASH', label: 'Tiền mặt', color: 'bg-green-600', icon: '₫' },
]

export function BookingFlow({ eventTitle, ticketTypes, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('booking')
  const [quantities, setQuantities] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('MOMO')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [reservationId, setReservationId] = useState(null)

  const totalTickets = Object.values(quantities).reduce((sum, q) => sum + q, 0)
  const totalPrice = ticketTypes.reduce((sum, t) => sum + (t.price * (quantities[t.ticketTypeId] || 0)), 0)

  const selectedItems = ticketTypes
    .filter((t) => quantities[t.ticketTypeId] > 0)
    .map((t) => ({ ticket: t, quantity: quantities[t.ticketTypeId], subtotal: t.price * quantities[t.ticketTypeId] }))

  const setQty = (id, delta) => {
    setQuantities((prev) => {
      const cur = prev[id] || 0
      const next = Math.max(0, Math.min(10, cur + delta))
      return { ...prev, [id]: next }
    })
  }

  const handleProceedToPayment = () => {
    if (!user) {
      onClose()
      navigate('/login')
      return
    }
    if (totalTickets === 0) { setError('Vui lòng chọn ít nhất 1 vé'); return }
    if (!confirmed) { setError('Vui lòng xác nhận thông tin'); return }
    setError('')
    setStep('payment')
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    setError('')
    try {
      const firstItem = selectedItems[0]
      const res = await reserve(firstItem.ticket.ticketTypeId, firstItem.quantity)

      if (res.status === 'PAID') {
        setStep('success')
        return
      }

      setReservationId(res.reservationId)
      const order = await purchase(res.reservationId, paymentMethod)
      setOrderId(order.orderId)
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Thanh toán thất bại. Vui lòng thử lại.')
      setStep('failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <AnimatePresence mode="wait">
          {/* STEP 1: Chọn vé */}
          {step === 'booking' && (
            <motion.div key="booking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Đặt Vé</h2>
              <p className="text-gray-600 mb-6">{eventTitle}</p>

              {!user && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">Bạn cần <button onClick={() => { onClose(); navigate('/login') }} className="underline font-semibold">đăng nhập</button> để đặt vé.</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Loại vé</h3>
                {ticketTypes.map((ticket) => (
                  <div key={ticket.ticketTypeId} className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-300 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{ticket.name}</h3>
                        <p className="text-sm text-gray-500 mb-2">Còn {ticket.quantity} vé</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {ticket.price === 0 ? 'Miễn phí' : VND.format(ticket.price)}
                          </span>
                          {ticket.price > 0 && <span className="text-sm text-gray-500">/ vé</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <span className="text-xs text-gray-500 font-semibold">Số lượng</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setQty(ticket.ticketTypeId, -1)}
                            disabled={(quantities[ticket.ticketTypeId] || 0) <= 0}
                            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <Minus className="w-5 h-5 text-gray-600" />
                          </button>
                          <span className="text-2xl font-bold text-gray-900 w-10 text-center">
                            {quantities[ticket.ticketTypeId] || 0}
                          </span>
                          <button type="button" onClick={() => setQty(ticket.ticketTypeId, 1)}
                            disabled={(quantities[ticket.ticketTypeId] || 0) >= 10}
                            className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-purple-200 mb-6 min-h-[120px]">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TicketIcon className="w-5 h-5 text-purple-600" /> Tóm tắt đơn hàng
                </h3>
                {selectedItems.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {selectedItems.map((item) => (
                      <div key={item.ticket.ticketTypeId} className="flex justify-between">
                        <span className="text-gray-700">{item.ticket.name} × {item.quantity}</span>
                        <span className="font-semibold">{VND.format(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-300 pt-2 flex justify-between items-center">
                      <span className="font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {VND.format(totalPrice)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">Chưa chọn vé nào</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 rounded" />
                <span className="text-sm text-gray-700">Tôi xác nhận thông tin đặt vé là chính xác <span className="text-red-500">*</span></span>
              </label>

              {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</p>}

              <button onClick={handleProceedToPayment}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                Tiếp tục thanh toán
              </button>
            </motion.div>
          )}

          {/* STEP 2: Thanh toán */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Thanh Toán</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order summary */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-purple-600" /> Đơn hàng
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-gray-500 text-xs mb-1">Sự kiện</p><p className="font-semibold">{eventTitle}</p></div>
                    <div className="border-t border-gray-200 pt-3">
                      {selectedItems.map((item) => (
                        <div key={item.ticket.ticketTypeId} className="flex justify-between mb-2">
                          <div><p className="font-semibold">{item.ticket.name}</p><p className="text-xs text-gray-500">{VND.format(item.ticket.price)} × {item.quantity}</p></div>
                          <p className="font-bold">{VND.format(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-bold">Tổng cộng</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{VND.format(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Phương thức thanh toán</h3>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <label key={pm.value} className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === pm.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                          <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value} onChange={() => setPaymentMethod(pm.value)} className="sr-only" />
                          <div className={`w-10 h-10 ${pm.color} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold">{pm.icon}</span>
                          </div>
                          <span className="font-medium text-gray-900">{pm.label}</span>
                          {paymentMethod === pm.value && <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />}
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" />{error}</p>}

                  <button onClick={handleConfirmPayment} disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</> : 'Xác nhận thanh toán'}
                  </button>
                  <button onClick={() => setStep('booking')} className="w-full py-3 text-gray-600 hover:text-purple-600 transition-colors text-sm">
                    ← Quay lại chọn vé
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 sm:p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thành công!</h2>
                <p className="text-gray-600 mb-6">Vé của bạn đã được đặt thành công. Kiểm tra mục "Vé của tôi" để xem QR code.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                    Đóng
                  </button>
                  <button onClick={() => { onClose(); navigate('/my-tickets') }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Xem vé của tôi
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* FAILED */}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 sm:p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thất bại</h2>
                <p className="text-gray-600 mb-4">{error || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setError(''); setStep('payment') }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Thử lại
                  </button>
                  <button onClick={onClose} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

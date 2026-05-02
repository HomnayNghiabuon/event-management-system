import { useState, useEffect } from 'react'
import { X, Plus, Minus, CheckCircle, XCircle, Ticket as TicketIcon, Loader2, Clock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { reserve, purchase, cancelReservation } from '../api/reservations'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const TIER_STYLE = {
  VIP:      { badge: 'bg-amber-100 text-amber-700 border border-amber-300', border: 'border-amber-300 hover:border-amber-400', dot: 'bg-amber-400' },
  STANDARD: { badge: 'bg-blue-100 text-blue-700 border border-blue-200',   border: 'border-gray-200 hover:border-purple-300', dot: 'bg-blue-400' },
  ECONOMY:  { badge: 'bg-green-100 text-green-700 border border-green-200', border: 'border-gray-200 hover:border-purple-300', dot: 'bg-green-400' },
}
const tierStyle = (name) => TIER_STYLE[name?.toUpperCase()] ?? TIER_STYLE.STANDARD

const PAYMENT_METHODS = [
  { value: 'MOMO',  label: 'Ví MoMo',   color: 'bg-pink-600',  icon: 'M' },
  { value: 'VNPAY', label: 'VNPay',      color: 'bg-red-600',   icon: 'V' },
  { value: 'CASH',  label: 'Tiền mặt',  color: 'bg-green-600', icon: '₫' },
]

export function BookingFlow({ eventTitle, ticketTypes, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // step: 'select' | 'attendee' | 'payment' | 'success' | 'failed' | 'expired'
  const [step, setStep] = useState('select')
  const [quantities, setQuantities] = useState({})
  const [reservations, setReservations] = useState([])
  // { [reservationId]: string[] }
  const [attendeeNames, setAttendeeNames] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('MOMO')
  const [expiresAt, setExpiresAt] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Countdown timer — chạy khi ở bước 'attendee'
  useEffect(() => {
    if (!expiresAt || step !== 'attendee') return
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left === 0) setStep('expired')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt, step])

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice   = ticketTypes.reduce((sum, t) => sum + t.price * (quantities[t.ticketTypeId] || 0), 0)
  const selectedItems = ticketTypes
    .filter(t => (quantities[t.ticketTypeId] || 0) > 0)
    .map(t => ({ ticket: t, quantity: quantities[t.ticketTypeId], subtotal: t.price * quantities[t.ticketTypeId] }))

  const setQty = (id, delta) =>
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, Math.min(10, (prev[id] || 0) + delta)),
    }))

  // ── Bước 1 → 2: gọi reserve cho từng loại vé ──
  const handleReserve = async () => {
    if (!user) { onClose(); navigate('/login'); return }
    if (totalTickets === 0) { setError('Vui lòng chọn ít nhất 1 vé'); return }
    setLoading(true)
    setError('')
    const made = []
    try {
      const results = []
      for (const item of selectedItems) {
        const res = await reserve(item.ticket.ticketTypeId, item.quantity)
        made.push(res)
        results.push({ ...res, ticketTypeName: item.ticket.name, ticketPrice: item.ticket.price })
      }
      setReservations(results)

      // Điền sẵn tên người dùng hiện tại cho mỗi slot
      const initNames = {}
      results.forEach(r => {
        initNames[r.reservationId] = Array(r.quantity).fill(user.fullName || '')
      })
      setAttendeeNames(initNames)

      // Đồng hồ đếm theo thời gian hết hạn sớm nhất
      const earliest = results
        .map(r => r.expirationTime)
        .filter(Boolean)
        .reduce((min, t) => (!min || new Date(t) < new Date(min) ? t : min), null)
      if (earliest) {
        setExpiresAt(earliest)
        setSecondsLeft(Math.max(0, Math.floor((new Date(earliest) - Date.now()) / 1000)))
      }

      setStep('attendee')
    } catch (err) {
      // Rollback các reservation đã tạo được
      for (const r of made) {
        cancelReservation(r.reservationId).catch(() => {})
      }
      setError(err.response?.data?.error || 'Không thể giữ vé. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Quay lại bước 1: huỷ reservation đang giữ
  const handleBackToSelect = async () => {
    for (const r of reservations) {
      if (r.status === 'PENDING') cancelReservation(r.reservationId).catch(() => {})
    }
    setReservations([])
    setAttendeeNames({})
    setExpiresAt(null)
    setStep('select')
  }

  // ── Bước 2 → 3: validate tên ──
  const handleProceedToPayment = () => {
    const allFilled = Object.values(attendeeNames).every(names => names.every(n => n.trim()))
    if (!allFilled) { setError('Vui lòng điền đầy đủ họ tên người tham dự'); return }
    setError('')
    setStep('payment')
  }

  // ── Bước 3: thanh toán ──
  const handleConfirmPayment = async () => {
    setLoading(true)
    setError('')
    try {
      for (const res of reservations) {
        const names = attendeeNames[res.reservationId] || []
        await purchase(res.reservationId, paymentMethod, names)
      }
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Thanh toán thất bại. Vui lòng thử lại.')
      setStep('failed')
    } finally {
      setLoading(false)
    }
  }

  const fmtTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const timerColor = secondsLeft > 60 ? 'text-green-600' : secondsLeft > 30 ? 'text-yellow-500' : 'text-red-600'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10">
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <AnimatePresence mode="wait">

          {/* ── BƯỚC 1: Chọn vé ── */}
          {step === 'select' && (
            <motion.div key="select"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Đặt vé</h2>
              <p className="text-gray-500 mb-6 text-sm">{eventTitle}</p>

              {!user && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  Bạn cần{' '}
                  <button onClick={() => { onClose(); navigate('/login') }} className="underline font-semibold">
                    đăng nhập
                  </button>{' '}
                  để đặt vé.
                </div>
              )}

              <div className="space-y-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại vé</p>
                {ticketTypes.map(ticket => {
                  const ts = tierStyle(ticket.name)
                  return (
                  <div key={ticket.ticketTypeId}
                    className={`border-2 rounded-xl p-5 transition-all ${ts.border}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{ticket.name}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ts.badge}`}>{ticket.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">Còn {ticket.quantity} vé</p>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {ticket.price === 0 ? 'Miễn phí' : VND.format(ticket.price)}
                        </span>
                        {ticket.price > 0 && <span className="text-xs text-gray-400 ml-1">/ vé</span>}
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-gray-500 font-medium">Số lượng</span>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setQty(ticket.ticketTypeId, -1)}
                            disabled={(quantities[ticket.ticketTypeId] || 0) <= 0}
                            className="w-9 h-9 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="text-xl font-bold text-gray-900 w-8 text-center">
                            {quantities[ticket.ticketTypeId] || 0}
                          </span>
                          <button type="button" onClick={() => setQty(ticket.ticketTypeId, 1)}
                            disabled={(quantities[ticket.ticketTypeId] || 0) >= Math.min(10, ticket.quantity)}
                            className="w-9 h-9 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                )}
              </div>

              {/* Tóm tắt */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-purple-200 mb-6 min-h-[96px]">
                <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <TicketIcon className="w-4 h-4 text-purple-600" /> Tóm tắt đơn hàng
                </p>
                {selectedItems.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {selectedItems.map(item => (
                      <div key={item.ticket.ticketTypeId} className="flex justify-between">
                        <span className="text-gray-700">{item.ticket.name} × {item.quantity}</span>
                        <span className="font-semibold">{VND.format(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-200 pt-2 flex justify-between font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {totalPrice === 0 ? 'Miễn phí' : VND.format(totalPrice)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-3">Chưa chọn vé nào</p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />{error}
                </p>
              )}

              <button onClick={handleReserve} disabled={loading || totalTickets === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-base hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                {loading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang giữ vé...</>
                  : 'Tiếp tục →'}
              </button>
            </motion.div>
          )}

          {/* ── BƯỚC 2: Nhập thông tin người tham dự ── */}
          {step === 'attendee' && (
            <motion.div key="attendee"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8">

              {/* Header + đồng hồ */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Thông tin người tham dự</h2>
                  <p className="text-gray-500 text-sm mt-1">{eventTitle}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <Clock className={`w-5 h-5 ${timerColor}`} />
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Vé được giữ</p>
                    <p className={`text-2xl font-mono font-bold leading-none mt-0.5 ${timerColor}`}>
                      {fmtTime(secondsLeft)}
                    </p>
                  </div>
                </div>
              </div>

              {secondsLeft <= 60 && secondsLeft > 0 && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  Còn ít thời gian! Hoàn tất trước khi vé bị giải phóng.
                </div>
              )}

              {/* Form theo từng loại vé */}
              <div className="space-y-5 mb-6">
                {reservations.map(res => (
                  <div key={res.reservationId} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <TicketIcon className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-900 text-sm">{res.ticketTypeName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierStyle(res.ticketTypeName).badge}`}>
                        {res.ticketTypeName}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-auto">
                        {res.quantity} vé
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(attendeeNames[res.reservationId] || []).map((name, idx) => (
                        <div key={idx}>
                          <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                            <User className="w-3 h-3" />
                            Người tham dự #{idx + 1}
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => {
                              const updated = [...(attendeeNames[res.reservationId] || [])]
                              updated[idx] = e.target.value
                              setAttendeeNames(prev => ({ ...prev, [res.reservationId]: updated }))
                            }}
                            placeholder="Nhập họ và tên đầy đủ"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />{error}
                </p>
              )}

              <div className="flex gap-3">
                <button onClick={handleBackToSelect}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium">
                  ← Quay lại
                </button>
                <button onClick={handleProceedToPayment}
                  className="flex-[3] py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Tiếp tục thanh toán →
                </button>
              </div>
            </motion.div>
          )}

          {/* ── BƯỚC 3: Thanh toán ── */}
          {step === 'payment' && (
            <motion.div key="payment"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Thanh toán</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tóm tắt */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                    <TicketIcon className="w-4 h-4 text-purple-600" /> Đơn hàng
                  </p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Sự kiện</p>
                      <p className="font-semibold">{eventTitle}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-3 space-y-2">
                      {reservations.map(res => (
                        <div key={res.reservationId} className="flex justify-between">
                          <div>
                            <p className="font-medium">{res.ticketTypeName}</p>
                            <p className="text-xs text-gray-400">{res.quantity} vé</p>
                          </div>
                          <p className="font-bold">
                            {res.ticketPrice === 0
                              ? 'Miễn phí'
                              : VND.format(res.ticketPrice * res.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-base bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {totalPrice === 0 ? 'Miễn phí' : VND.format(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Phương thức thanh toán</p>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map(pm => (
                        <label key={pm.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            paymentMethod === pm.value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}>
                          <input type="radio" name="payment" value={pm.value}
                            checked={paymentMethod === pm.value}
                            onChange={() => setPaymentMethod(pm.value)} className="sr-only" />
                          <div className={`w-10 h-10 ${pm.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold">{pm.icon}</span>
                          </div>
                          <span className="font-medium text-gray-900">{pm.label}</span>
                          {paymentMethod === pm.value && (
                            <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4 flex-shrink-0" />{error}
                    </p>
                  )}

                  <button onClick={handleConfirmPayment} disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</>
                      : totalPrice === 0 ? 'Xác nhận nhận vé' : 'Xác nhận thanh toán'}
                  </button>
                  <button onClick={() => setStep('attendee')}
                    className="w-full py-3 text-gray-500 hover:text-purple-600 transition-colors text-sm">
                    ← Quay lại
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── THÀNH CÔNG ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Đặt vé thành công!</h2>
                <p className="text-gray-500 mb-8">
                  Vé đã được xác nhận. Vào mục "Vé của tôi" để xem và tải xuống vé.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                    Đóng
                  </button>
                  <button onClick={() => { onClose(); navigate('/my-tickets') }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Xem vé của tôi
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── THẤT BẠI ── */}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Thanh toán thất bại</h2>
                <p className="text-gray-500 mb-8">{error || 'Đã có lỗi xảy ra. Vui lòng thử lại.'}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setError(''); setStep('payment') }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Thử lại
                  </button>
                  <button onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── HẾT THỜI GIAN ── */}
          {step === 'expired' && (
            <motion.div key="expired" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="p-6 sm:p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-yellow-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Hết thời gian giữ vé</h2>
                <p className="text-gray-500 mb-8">
                  Vé đã được giải phóng sau 5 phút. Vui lòng chọn lại từ đầu.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setReservations([])
                      setAttendeeNames({})
                      setExpiresAt(null)
                      setQuantities({})
                      setStep('select')
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Chọn lại vé
                  </button>
                  <button onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
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

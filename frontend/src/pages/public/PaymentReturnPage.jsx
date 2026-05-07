import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router'
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { getOrderByCode } from '../../api/payments'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 10

export function PaymentReturnPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const provider = params.get('provider') || (params.get('vnp_TxnRef') ? 'VNPAY' : 'MOMO')
  const orderCode = params.get('vnp_TxnRef') || params.get('orderId')
  const responseCode = params.get('vnp_ResponseCode') || params.get('resultCode')

  const [status, setStatus] = useState('verifying') // verifying | success | failed | not_found
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!orderCode) {
      setStatus('not_found')
      return
    }

    let attempts = 0
    let cancelled = false

    const poll = async () => {
      if (cancelled) return
      attempts += 1
      try {
        const data = await getOrderByCode(orderCode)
        setOrder(data)
        if (data.paymentStatus === 'PAID') {
          setStatus('success')
          return
        }
        if (data.paymentStatus === 'FAILED' || data.paymentStatus === 'EXPIRED') {
          setStatus('failed')
          return
        }
        // Còn AWAITING_GATEWAY → poll tiếp
        if (attempts < MAX_POLLS) {
          setTimeout(poll, POLL_INTERVAL_MS)
        } else {
          setStatus(responseCode === '00' || responseCode === '0' ? 'verifying_timeout' : 'failed')
        }
      } catch {
        if (attempts < MAX_POLLS) {
          setTimeout(poll, POLL_INTERVAL_MS)
        } else {
          setStatus('not_found')
        }
      }
    }

    poll()
    return () => { cancelled = true }
  }, [orderCode, responseCode])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xác minh thanh toán...</h1>
              <p className="text-gray-500">Vui lòng chờ trong giây lát.</p>
              <p className="text-xs text-gray-400 mt-4">Mã đơn: {orderCode || '—'} ({provider})</p>
            </>
          )}

          {status === 'verifying_timeout' && (
            <>
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang chờ xác nhận từ ngân hàng</h1>
              <p className="text-gray-500 mb-6">
                Giao dịch của bạn đang được xử lý. Vé sẽ xuất hiện trong "Vé của tôi" khi xác nhận hoàn tất.
              </p>
              <button onClick={() => navigate('/my-orders')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                Xem đơn hàng
              </button>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-500 mb-2">Vé đã được xác nhận.</p>
              {order && (
                <p className="text-sm text-gray-400 mb-6">
                  Mã đơn #{order.orderId} · {order.tickets?.length || 0} vé
                </p>
              )}
              <div className="flex gap-3 justify-center">
                <Link to="/my-tickets"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                  Xem vé của tôi
                </Link>
                <Link to="/"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl">
                  Về trang chủ
                </Link>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán không thành công</h1>
              <p className="text-gray-500 mb-6">
                Giao dịch bị hủy hoặc thất bại. Vé đã được hoàn trả, bạn có thể thử lại.
              </p>
              <Link to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                Về trang chủ
              </Link>
            </>
          )}

          {status === 'not_found' && (
            <>
              <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy giao dịch</h1>
              <p className="text-gray-500 mb-6">
                Đường dẫn không hợp lệ hoặc đơn hàng không tồn tại.
              </p>
              <Link to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                Về trang chủ
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

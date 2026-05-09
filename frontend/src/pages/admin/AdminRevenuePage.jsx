import { useEffect, useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getAdminRevenue } from '../../api/revenue'
import { TrendingUp, DollarSign, ArrowDownRight } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function AdminRevenuePage() {
  const [from, setFrom] = useState(daysAgo(30))
  const [to, setTo] = useState(today())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getAdminRevenue(from, to)
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'Không tải được doanh thu'))
      .finally(() => setLoading(false))
  }, [from, to])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Doanh thu nền tảng</h1>
          <p className="text-gray-500 text-sm mt-1">Thống kê doanh thu toàn hệ thống từ các đơn hàng đã thanh toán.</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Từ ngày</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Đến ngày</label>
            <input type="date" value={to} min={from} max={today()} onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((n) => (
              <button key={n} onClick={() => { setFrom(daysAgo(n)); setTo(today()) }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">{n} ngày</button>
            ))}
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{VND.format(Number(data.grossAmount || 0))}</p>
              <p className="text-xs text-gray-400 mt-1">Tổng tiền vé bán được</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Hoa hồng nền tảng</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{VND.format(Number(data.commissionAmount || 0))}</p>
              <p className="text-xs text-gray-400 mt-1">Phí thu từ các Organizer</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-600">Đã trả Organizer</p>
              </div>
              <p className="text-2xl font-bold text-gray-700">{VND.format(Number(data.netAmount || 0))}</p>
              <p className="text-xs text-gray-400 mt-1">Tổng tiền net về tay organizer</p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <p className="text-xs text-gray-400 mt-4 text-center">
            Khoảng: {data.from?.slice(0, 10)} → {data.to?.slice(0, 10)}
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}

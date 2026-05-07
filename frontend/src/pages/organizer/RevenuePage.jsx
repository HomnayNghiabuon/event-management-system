import { useEffect, useState } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getOrganizerRevenue } from '../../api/revenue'
import { TrendingUp, DollarSign, Wallet } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function RevenuePage() {
  const [from, setFrom] = useState(daysAgo(30))
  const [to, setTo] = useState(today())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    getOrganizerRevenue(from, to)
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'Không tải được doanh thu'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [from, to])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Doanh thu</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng doanh thu, hoa hồng phải trả và lợi nhuận thực nhận của bạn.
          </p>
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
            <button onClick={() => { setFrom(daysAgo(7)); setTo(today()) }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">7 ngày</button>
            <button onClick={() => { setFrom(daysAgo(30)); setTo(today()) }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">30 ngày</button>
            <button onClick={() => { setFrom(daysAgo(90)); setTo(today()) }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">90 ngày</button>
          </div>
        </div>

        {loading && <LoadingSpinner />}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card icon={<DollarSign className="w-5 h-5 text-blue-600" />} bg="bg-blue-50"
              label="Tổng doanh thu (gross)" value={data.grossAmount} hint="Tổng tiền vé bán được" />
            <Card icon={<TrendingUp className="w-5 h-5 text-orange-600" />} bg="bg-orange-50"
              label="Hoa hồng nền tảng" value={data.commissionAmount} hint="Phí phải trả cho hệ thống" />
            <Card icon={<Wallet className="w-5 h-5 text-green-600" />} bg="bg-green-50"
              label="Thực nhận (net)" value={data.netAmount} hint="Số tiền tổ chức nhận về" big />
          </div>
        )}

        {!loading && !error && data && (
          <p className="mt-6 text-xs text-gray-400">
            Khoảng: {data.from?.slice(0, 10)} → {data.to?.slice(0, 10)}
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}

function Card({ icon, bg, label, value, hint, big }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <p className={`font-bold text-gray-900 ${big ? 'text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-2xl'}`}>
        {VND.format(Number(value || 0))}
      </p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getEventStats } from '../../api/events'
import { ArrowLeft, Ticket, DollarSign, Users, CheckCircle, ShoppingCart, TrendingUp } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export function EventStatsPage() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getEventStats(id)
      .then(setStats)
      .catch(() => setError('Không tải được thống kê'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link to="/organizer" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê sự kiện</h1>
          {stats && <p className="text-gray-500 mt-1">{stats.title}</p>}
        </div>

        {loading ? <LoadingSpinner /> : error ? (
          <div className="text-center py-16"><p className="text-red-500">{error}</p></div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard icon={Ticket} label="Vé đã bán" value={stats.totalTicketsSold} color="bg-gradient-to-br from-blue-500 to-purple-600" sub={`Còn ${stats.totalTicketsAvailable} vé`} />
              <StatCard icon={CheckCircle} label="Đã check-in" value={stats.checkedInCount} color="bg-gradient-to-br from-green-500 to-emerald-600" />
              <StatCard icon={ShoppingCart} label="Tổng đơn hàng" value={stats.totalOrders} color="bg-gradient-to-br from-orange-500 to-red-500" />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" /> Doanh thu
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-blue-700">{VND.format(stats.totalRevenue)}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Phí hoa hồng ({stats.commissionPercent}%)</p>
                  <p className="text-2xl font-bold text-orange-600">{VND.format(stats.commissionAmount)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Doanh thu thực nhận</p>
                  <p className="text-2xl font-bold text-green-700">{VND.format(stats.netRevenue)}</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ bán vé</h2>
              <div className="space-y-4">
                {(() => {
                  const total = stats.totalTicketsSold + stats.totalTicketsAvailable
                  const pct = total > 0 ? Math.round((stats.totalTicketsSold / total) * 100) : 0
                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Đã bán: {stats.totalTicketsSold}</span>
                        <span>{pct}%</span>
                        <span>Tổng: {total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

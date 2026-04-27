import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getAdminStats } from '../../api/admin'
import { Calendar, Users, ShoppingCart, TrendingUp, Clock, CheckCircle, XCircle, Building } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

function StatCard({ icon: Icon, label, value, color, link }) {
  const card = (
    <div className={`bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
  return link ? <Link to={link}>{card}</Link> : card
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Tổng quan hệ thống quản lý sự kiện</p>

        {loading ? <LoadingSpinner /> : stats ? (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Calendar} label="Tổng sự kiện" value={stats.totalEvents} color="bg-gradient-to-br from-blue-500 to-purple-600" link="/admin/events" />
              <StatCard icon={Clock} label="Chờ duyệt" value={stats.pendingEvents} color="bg-gradient-to-br from-yellow-400 to-orange-500" link="/admin/events" />
              <StatCard icon={CheckCircle} label="Đã duyệt" value={stats.approvedEvents} color="bg-gradient-to-br from-green-500 to-emerald-600" />
              <StatCard icon={XCircle} label="Bị từ chối" value={stats.rejectedEvents} color="bg-gradient-to-br from-red-500 to-rose-600" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building} label="Organizers" value={stats.totalOrganizers} color="bg-gradient-to-br from-purple-500 to-pink-600" link="/admin/organizers" />
              <StatCard icon={Users} label="Người tham dự" value={stats.totalAttendees?.toLocaleString('vi-VN') || 0} color="bg-gradient-to-br from-cyan-500 to-blue-600" />
              <StatCard icon={ShoppingCart} label="Tổng đơn hàng" value={stats.totalOrders?.toLocaleString('vi-VN') || 0} color="bg-gradient-to-br from-orange-500 to-red-500" />
              <StatCard icon={TrendingUp} label="Tổng doanh thu" value={VND.format(stats.totalRevenue || 0)} color="bg-gradient-to-br from-green-600 to-teal-600" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/admin/events" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Duyệt sự kiện</p>
                    <p className="text-sm text-gray-500">{stats.pendingEvents} sự kiện chờ duyệt</p>
                  </div>
                </div>
              </Link>
              <Link to="/admin/organizers" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Quản lý Organizer</p>
                    <p className="text-sm text-gray-500">{stats.totalOrganizers} organizers</p>
                  </div>
                </div>
              </Link>
              <Link to="/admin/commissions" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Commission</p>
                    <p className="text-sm text-gray-500">Quản lý hoa hồng</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Không tải được dữ liệu</p>
        )}
      </main>
      <Footer />
    </div>
  )
}

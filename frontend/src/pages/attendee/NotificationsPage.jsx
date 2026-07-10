import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications'
import { Bell, CheckCheck } from 'lucide-react'

const TYPE_CONFIG = {
  ORDER_CONFIRMED: { label: 'Đặt vé thành công', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  EVENT_APPROVED: { label: 'Sự kiện được duyệt', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  EVENT_REJECTED: { label: 'Sự kiện bị từ chối', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getNotifications(page, 20)
      .then((data) => { setNotifications(data.content || []); setTotalPages(data.totalPages || 0) })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleMarkRead = async (id) => {
    await markAsRead(id).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.notificationId === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAll = async () => {
    await markAllAsRead().catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            {unread > 0 && <p className="text-sm text-purple-600 mt-1">{unread} chưa đọc</p>}
          </div>
          {unread > 0 && (
            <button onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-all">
              <CheckCheck className="w-4 h-4" /> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type] || { label: n.type, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
              return (
                <div
                  key={n.notificationId}
                  onClick={() => !n.isRead && handleMarkRead(n.notificationId)}
                  className={`bg-white rounded-xl p-5 shadow-sm border cursor-pointer hover:shadow-md transition-all ${!n.isRead ? 'border-purple-200 border-l-4 border-l-purple-500' : 'border-gray-100'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? cfg.dot : 'bg-gray-200'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        {!n.isRead && <span className="text-xs text-purple-600 font-medium">Mới</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{n.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm">Trước</button>
                <span className="px-4 py-2 text-sm text-gray-600">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm">Tiếp</button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

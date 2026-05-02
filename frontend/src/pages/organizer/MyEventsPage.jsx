import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMyEvents, publishEvent, deleteEvent, sendEventNotification } from '../../api/events'
import { Plus, Calendar, MapPin, Eye, Edit, Trash2, BarChart2, Users, Loader2, Mail, X, Send, CheckCircle } from 'lucide-react'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

const STATUS_CONFIG = {
  PUBLISHED: { text: 'Đang mở', cls: 'bg-green-100 text-green-700' },
  DRAFT: { text: 'Nháp', cls: 'bg-gray-100 text-gray-600' },
}
const APPROVAL_CONFIG = {
  PENDING: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700' },
  REJECTED: { text: 'Bị từ chối', cls: 'bg-red-100 text-red-700' },
}

export function MyEventsPage() {
  const [events, setEvents] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [notifyEvent, setNotifyEvent] = useState(null)
  const [notifyForm, setNotifyForm] = useState({ subject: '', message: '' })
  const [notifySending, setNotifySending] = useState(false)
  const [notifyResult, setNotifyResult] = useState(null)
  const [notifyError, setNotifyError] = useState('')

  const load = () => {
    setLoading(true)
    getMyEvents(page, 10)
      .then((data) => { setEvents(data.content || []); setTotalPages(data.totalPages || 0) })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handlePublish = async (event) => {
    setActionId(event.eventId)
    try {
      const isPublished = event.status === 'PUBLISHED'
      await publishEvent(event.eventId, !isPublished)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể thực hiện thao tác')
    } finally {
      setActionId(null)
    }
  }

  const openNotify = (event) => {
    setNotifyEvent(event)
    setNotifyForm({ subject: `Thông báo về sự kiện: ${event.title}`, message: '' })
    setNotifyResult(null)
    setNotifyError('')
  }

  const handleNotify = async (e) => {
    e.preventDefault()
    setNotifyError('')
    setNotifySending(true)
    try {
      const result = await sendEventNotification(notifyEvent.eventId, notifyForm)
      setNotifyResult(result)
    } catch (err) {
      setNotifyError(err.response?.data?.error || 'Gửi thất bại')
    } finally {
      setNotifySending(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa sự kiện này?')) return
    setActionId(id)
    try {
      await deleteEvent(id)
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể xóa')
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sự kiện của tôi</h1>
          <Link to="/organizer/events/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
            <Plus className="w-4 h-4" /> Tạo sự kiện
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Bạn chưa có sự kiện nào</p>
            <Link to="/organizer/events/create" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
              <Plus className="w-4 h-4" /> Tạo sự kiện đầu tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const statusCfg = STATUS_CONFIG[event.status] || { text: event.status, cls: 'bg-gray-100 text-gray-600' }
              const approvalCfg = APPROVAL_CONFIG[event.approvalStatus] || { text: event.approvalStatus, cls: 'bg-gray-100 text-gray-600' }
              const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString('vi-VN') : ''

              return (
                <div key={event.eventId} className="bg-white rounded-xl shadow-md p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-32 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {event.thumbnail ? (
                        <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <span className="text-2xl">🎫</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{event.title}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCfg.cls}`}>{statusCfg.text}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${approvalCfg.cls}`}>{approvalCfg.text}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                        {event.minPrice != null && <span className="font-medium text-purple-600">{event.minPrice === 0 ? 'Miễn phí' : `Từ ${VND.format(event.minPrice)}`}</span>}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/event/${event.eventId}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium transition-all">
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </Link>
                        {event.status === 'DRAFT' && (
                          <Link to={`/organizer/events/${event.eventId}/edit`}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-xs font-medium transition-all">
                            <Edit className="w-3.5 h-3.5" /> Sửa
                          </Link>
                        )}
                        <Link to={`/organizer/events/${event.eventId}/attendees`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium transition-all">
                          <Users className="w-3.5 h-3.5" /> Attendees
                        </Link>
                        <Link to={`/organizer/events/${event.eventId}/stats`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium transition-all">
                          <BarChart2 className="w-3.5 h-3.5" /> Thống kê
                        </Link>
                        {event.approvalStatus === 'APPROVED' && (
                          <button onClick={() => handlePublish(event)} disabled={actionId === event.eventId}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${event.status === 'PUBLISHED' ? 'border border-orange-300 text-orange-600 hover:bg-orange-50' : 'border border-green-300 text-green-600 hover:bg-green-50'}`}>
                            {actionId === event.eventId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            {event.status === 'PUBLISHED' ? 'Ẩn' : 'Publish'}
                          </button>
                        )}
                        <button onClick={() => openNotify(event)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 text-xs font-medium transition-all">
                          <Mail className="w-3.5 h-3.5" /> Thông báo
                        </button>
                        <button onClick={() => handleDelete(event.eventId)} disabled={actionId === event.eventId}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-xs font-medium transition-all">
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
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

      {/* Notify Modal */}
      {notifyEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" /> Gửi thông báo
              </h3>
              <button onClick={() => setNotifyEvent(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4 bg-gray-50 rounded-lg px-3 py-2 truncate">
              Sự kiện: <span className="font-medium text-gray-700">{notifyEvent.title}</span>
            </p>

            {notifyResult ? (
              <div className="text-center py-6">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-bold text-gray-900">Gửi thành công!</p>
                <p className="text-gray-500 mt-1">
                  Đã xử lý <span className="font-semibold text-indigo-600">{notifyResult.sent}</span> / {notifyResult.total} người tham dự
                </p>
                {notifyResult.total === 0 && (
                  <p className="text-sm text-yellow-600 mt-2">Sự kiện chưa có người mua vé.</p>
                )}
                <button onClick={() => setNotifyEvent(null)}
                  className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all">
                  Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleNotify} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề *</label>
                  <input
                    type="text"
                    value={notifyForm.subject}
                    onChange={(e) => setNotifyForm({ ...notifyForm, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nội dung *</label>
                  <textarea
                    value={notifyForm.message}
                    onChange={(e) => setNotifyForm({ ...notifyForm, message: e.target.value })}
                    required
                    rows={5}
                    placeholder="Nhập nội dung thông báo gửi đến người tham dự..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
                  />
                </div>
                {notifyError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{notifyError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setNotifyEvent(null)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
                    Hủy
                  </button>
                  <button type="submit" disabled={notifySending}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {notifySending ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</> : <><Send className="w-4 h-4" /> Gửi thông báo</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

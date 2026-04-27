import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getAdminEvents, reviewEvent } from '../../api/admin'
import { Calendar, MapPin, CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react'

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
]

const APPROVAL_CONFIG = {
  PENDING: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { text: 'Đã duyệt', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { text: 'Từ chối', cls: 'bg-red-100 text-red-700', icon: XCircle },
}

export function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = () => {
    setLoading(true)
    const params = { page, size: 10 }
    if (filter) params.approvalStatus = filter
    getAdminEvents(params)
      .then((data) => { setEvents(data.content || []); setTotalPages(data.totalPages || 0) })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filter])

  const handleApprove = async (eventId) => {
    setActionId(eventId)
    try { await reviewEvent(eventId, 'APPROVE'); load() }
    catch (err) { alert(err.response?.data?.error || 'Thất bại') }
    finally { setActionId(null) }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Vui lòng nhập lý do từ chối'); return }
    setActionId(rejectModal)
    try { await reviewEvent(rejectModal, 'REJECT', rejectReason); setRejectModal(null); setRejectReason(''); load() }
    catch (err) { alert(err.response?.data?.error || 'Thất bại') }
    finally { setActionId(null) }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý sự kiện</h1>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setFilter(opt.value); setPage(0) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === opt.value ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có sự kiện nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const approval = APPROVAL_CONFIG[event.approvalStatus] || { text: event.approvalStatus, cls: 'bg-gray-100 text-gray-600', icon: Clock }
              const ApprovalIcon = approval.icon
              const date = event.eventDate ? new Date(event.eventDate).toLocaleDateString('vi-VN') : ''

              return (
                <div key={event.eventId} className="bg-white rounded-xl shadow-md p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{event.title}</h3>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${approval.cls}`}>
                          <ApprovalIcon className="w-3 h-3" />{approval.text}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
                      </div>
                      {event.organizer && (
                        <p className="text-sm text-gray-500 mb-3">
                          Organizer: <span className="font-medium text-gray-700">{event.organizer.name}</span>
                          <span className="text-gray-400"> ({event.organizer.email})</span>
                        </p>
                      )}
                      {event.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <p className="text-xs text-red-700"><strong>Lý do từ chối:</strong> {event.rejectionReason}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/event/${event.eventId}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-medium transition-all">
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </Link>
                        {event.approvalStatus === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(event.eventId)} disabled={actionId === event.eventId}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs font-medium transition-all disabled:opacity-60">
                              {actionId === event.eventId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Duyệt
                            </button>
                            <button onClick={() => { setRejectModal(event.eventId); setRejectReason('') }} disabled={actionId === event.eventId}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium transition-all disabled:opacity-60">
                              <XCircle className="w-3.5 h-3.5" /> Từ chối
                            </button>
                          </>
                        )}
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

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Từ chối sự kiện</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
                Hủy
              </button>
              <button onClick={handleReject} disabled={actionId !== null}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {actionId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

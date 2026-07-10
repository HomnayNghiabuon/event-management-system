import { useState } from 'react'
import { Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { broadcastNotification } from '../../api/admin'
import { Bell, Send, Users, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

const TARGETS = [
  { value: 'ALL', label: 'Tất cả người dùng', desc: 'Gửi đến Admin, Organizer và Attendee' },
  { value: 'ATTENDEE', label: 'Người tham dự', desc: 'Chỉ gửi đến Attendee' },
  { value: 'ORGANIZER', label: 'Ban tổ chức', desc: 'Chỉ gửi đến Organizer' },
]

export function AdminNotificationsPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetRole, setTargetRole] = useState('ALL')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null) // { sent: number } | null
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    if (!confirm(`Gửi thông báo đến "${TARGETS.find(t => t.value === targetRole)?.label}"?`)) return

    setSending(true)
    setResult(null)
    setError('')
    try {
      const data = await broadcastNotification(title.trim(), message.trim(), targetRole)
      setResult(data)
      setTitle('')
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi thông báo thất bại')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link to="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Về Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
            <p className="text-sm text-gray-500">Gửi thông báo hệ thống đến người dùng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          {/* Target role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Đối tượng nhận
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TARGETS.map((t) => (
                <label
                  key={t.value}
                  className={`flex flex-col gap-0.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    targetRole === t.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="targetRole"
                      value={t.value}
                      checked={targetRole === t.value}
                      onChange={() => setTargetRole(t.value)}
                      className="accent-purple-600"
                    />
                    <span className={`text-sm font-semibold ${targetRole === t.value ? 'text-purple-700' : 'text-gray-700'}`}>
                      {t.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 ml-5">{t.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiêu đề thông báo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Thông báo bảo trì hệ thống"
              maxLength={255}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/255</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nội dung thông báo</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo..."
              rows={5}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Result / Error */}
          {result && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm font-medium">
                Đã gửi thành công đến <strong>{result.sent}</strong> người dùng.
              </p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}

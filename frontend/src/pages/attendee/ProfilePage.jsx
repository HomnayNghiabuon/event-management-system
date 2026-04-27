import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMe, updateMe } from '../../api/users'
import { useAuth } from '../../contexts/AuthContext'
import { User, Loader2, CheckCircle } from 'lucide-react'

export function ProfilePage() {
  const { user: authUser, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', organizationName: '', currentPassword: '', newPassword: '' })

  useEffect(() => {
    getMe()
      .then((data) => {
        setProfile(data)
        setForm({ fullName: data.fullName || '', email: data.email || '', phone: data.phone || '', organizationName: data.organizationName || '', currentPassword: '', newPassword: '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (form.newPassword && form.newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự'); return }
    setSaving(true)
    try {
      const payload = { fullName: form.fullName, email: form.email, phone: form.phone || null, organizationName: form.organizationName || null }
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword }
      await updateMe(payload)
      setSuccess(true)
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }))
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const ROLE_LABEL = { ADMIN: 'Quản trị viên', ORGANIZER: 'Organizer', ATTENDEE: 'Người tham dự' }

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1"><LoadingSpinner /></div><Footer /></div>

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold">{profile?.fullName}</h2>
            <p className="text-white/80 text-sm">{profile?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
              {ROLE_LABEL[profile?.role] || profile?.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Thông tin cá nhân</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            {(authUser?.role === 'ORGANIZER') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tên tổ chức</label>
                  <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 pt-2">Đổi mật khẩu (tuỳ chọn)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Nhập để đổi mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-green-700 text-sm font-medium">Cập nhật thành công!</p>
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...</> : 'Lưu thay đổi'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}

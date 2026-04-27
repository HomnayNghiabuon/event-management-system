import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer } from '../../api/admin'
import { Building, Plus, Edit, Trash2, Search, X, Loader2 } from 'lucide-react'

const EMPTY_FORM = { fullName: '', email: '', password: '', phone: '', organizationName: '' }

export function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    const params = { page, size: 10 }
    if (appliedSearch) params.search = appliedSearch
    getOrganizers(params)
      .then((data) => { setOrganizers(data.content || []); setTotalPages(data.totalPages || 0) })
      .catch(() => setOrganizers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, appliedSearch])

  const openCreate = () => { setForm(EMPTY_FORM); setError(''); setModal('create') }
  const openEdit = (org) => { setForm({ fullName: org.fullName, email: org.email, password: '', phone: org.phone || '', organizationName: org.organizationName || '' }); setError(''); setModal(org.organizerId) }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (modal === 'create') await createOrganizer(form)
      else await updateOrganizer(modal, form)
      setModal(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa organizer này?')) return
    try { await deleteOrganizer(id); load() }
    catch (err) { alert(err.response?.data?.error || 'Không thể xóa') }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Organizer</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
            <Plus className="w-4 h-4" /> Thêm Organizer
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo tên, email..." value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (setAppliedSearch(search), setPage(0))}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm shadow-sm" />
          </div>
          <button onClick={() => { setAppliedSearch(search); setPage(0) }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm font-medium">
            Tìm
          </button>
        </div>

        {loading ? <LoadingSpinner /> : organizers.length === 0 ? (
          <div className="text-center py-16">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có organizer nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổ chức</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Điện thoại</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tạo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {organizers.map((org) => (
                    <tr key={org.organizerId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{org.fullName?.[0]}</span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{org.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{org.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{org.organizationName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{org.phone || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{org.createdAt ? new Date(org.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(org)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(org.organizerId)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{modal === 'create' ? 'Thêm Organizer' : 'Sửa Organizer'}</h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ tên *</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{modal === 'create' ? 'Mật khẩu *' : 'Mật khẩu mới (bỏ trống để giữ nguyên)'}</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={modal === 'create'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Điện thoại</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tổ chức</label>
                  <input type="text" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">Hủy</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

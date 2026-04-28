import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/categories'
import { Tag, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ name: '', description: '' })
    setEditId(null)
    setError('')
    setModal(true)
  }

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '' })
    setEditId(c.categoryId)
    setError('')
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editId) await updateCategory(editId, form)
      else await createCategory(form)
      setModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Xóa danh mục "${c.name}"?`)) return
    setDeleting(c.categoryId)
    try {
      await deleteCategory(c.categoryId)
      load()
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Xóa thất bại')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
            <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa các danh mục sự kiện</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>

        {loading ? <LoadingSpinner /> : categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có danh mục nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.categoryId} className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                    {c.description && (
                      <p className="text-sm text-gray-500 truncate">{c.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    disabled={deleting === c.categoryId}
                    className="p-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
                    title="Xóa"
                  >
                    {deleting === c.categoryId
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
              </h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên danh mục *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={100}
                  placeholder="VD: Âm nhạc, Thể thao, Công nghệ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả ngắn về danh mục..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
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

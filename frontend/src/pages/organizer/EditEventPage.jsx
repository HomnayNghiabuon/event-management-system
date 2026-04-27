import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getEventById, updateEvent } from '../../api/events'
import { getCategories } from '../../api/categories'
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react'

export function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)

  useEffect(() => {
    Promise.all([getEventById(id), getCategories()])
      .then(([event, cats]) => {
        setCategories(cats)
        setForm({
          title: event.title || '',
          description: event.description || '',
          categoryId: event.categoryId || '',
          location: event.location || '',
          eventDate: event.eventDate || '',
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          thumbnail: event.thumbnail || '',
          ticketTypes: event.ticketTypes?.map((t) => ({ name: t.name, price: t.price, quantity: t.quantity })) || [],
        })
      })
      .catch(() => setError('Không tải được sự kiện'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const setTicket = (idx, field, value) => setForm((f) => {
    const ticketTypes = [...f.ticketTypes]
    ticketTypes[idx] = { ...ticketTypes[idx], [field]: value }
    return { ...f, ticketTypes }
  })
  const addTicket = () => setForm((f) => ({ ...f, ticketTypes: [...f.ticketTypes, { name: '', price: 0, quantity: 50 }] }))
  const removeTicket = (idx) => setForm((f) => ({ ...f, ticketTypes: f.ticketTypes.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        categoryId: parseInt(form.categoryId),
        ticketTypes: form.ticketTypes.map((t) => ({ ...t, price: parseFloat(t.price), quantity: parseInt(t.quantity) })),
      }
      await updateEvent(id, payload)
      navigate('/organizer')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setError(Object.values(data.errors).join(', '))
      else setError(data?.error || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1"><LoadingSpinner /></div><Footer /></div>
  if (error && !form) return (
    <div className="min-h-screen flex flex-col"><Header />
      <div className="flex-1 flex items-center justify-center"><div className="text-center"><p className="text-red-500 mb-4">{error}</p><Link to="/organizer" className="text-purple-600 hover:underline">Quay lại</Link></div></div>
    <Footer /></div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link to="/organizer" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa sự kiện</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Thông tin cơ bản</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện *</label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
                <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white">
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm *</label>
                <input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày *</label>
                <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} required min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bắt đầu *</label>
                <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kết thúc *</label>
                <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">URL ảnh</label>
              <input type="url" value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              {form.thumbnail && <img src={form.thumbnail} alt="preview" className="mt-2 h-32 w-full object-cover rounded-lg" onError={(e) => e.target.style.display='none'} />}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-semibold text-gray-900">Loại vé</h2>
              <button type="button" onClick={addTicket}
                className="flex items-center gap-2 px-3 py-1.5 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium transition-all">
                <Plus className="w-4 h-4" /> Thêm
              </button>
            </div>
            <div className="space-y-4">
              {form.ticketTypes.map((t, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Loại vé #{idx + 1}</span>
                    {form.ticketTypes.length > 1 && (
                      <button type="button" onClick={() => removeTicket(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Tên *</label>
                      <input type="text" value={t.name} onChange={(e) => setTicket(idx, 'name', e.target.value)} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Giá (VND) *</label>
                      <input type="number" value={t.price} onChange={(e) => setTicket(idx, 'price', e.target.value)} required min="0"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1">Số lượng *</label>
                      <input type="number" value={t.quantity} onChange={(e) => setTicket(idx, 'quantity', e.target.value)} required min="1"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}

          <div className="flex gap-3">
            <Link to="/organizer" className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-50 transition-all">Hủy</Link>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...</> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

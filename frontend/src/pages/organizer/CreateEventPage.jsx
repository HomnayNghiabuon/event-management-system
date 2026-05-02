import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { createEvent } from '../../api/events'
import { getCategories } from '../../api/categories'
import { uploadImage } from '../../api/upload'
import { ArrowLeft, Plus, Trash2, Loader2, ImagePlus, X } from 'lucide-react'
import { LocationPickerMap } from '../../components/LocationPickerMap'

export function CreateEventPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', location: '', latitude: null, longitude: null, addressDetail: '',
    eventDate: '', startTime: '', endTime: '', thumbnail: '',
    ticketTypes: [{ name: 'Standard', price: 0, quantity: 100 }],
  })
  const [previewUrl, setPreviewUrl] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => { getCategories().then(setCategories).catch(() => {}) }, [])

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    try {
      const url = await uploadImage(file)
      set('thumbnail', url)
    } catch {
      setError('Upload ảnh thất bại')
      setPreviewUrl('')
    } finally {
      setUploading(false)
    }
  }

  const clearImage = () => {
    setPreviewUrl('')
    set('thumbnail', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const setTicket = (idx, field, value) => {
    setForm((f) => {
      const ticketTypes = [...f.ticketTypes]
      ticketTypes[idx] = { ...ticketTypes[idx], [field]: value }
      return { ...f, ticketTypes }
    })
  }

  const addTicket = () => setForm((f) => ({ ...f, ticketTypes: [...f.ticketTypes, { name: '', price: 0, quantity: 50 }] }))
  const removeTicket = (idx) => setForm((f) => ({ ...f, ticketTypes: f.ticketTypes.filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.ticketTypes.length === 0) { setError('Phải có ít nhất 1 loại vé'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        categoryId: parseInt(form.categoryId),
        latitude: form.latitude || null,
        longitude: form.longitude || null,
        ticketTypes: form.ticketTypes.map((t) => ({ ...t, price: parseFloat(t.price), quantity: parseInt(t.quantity) })),
      }
      await createEvent(payload)
      navigate('/organizer')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setError(Object.values(data.errors).join(', '))
      else setError(data?.error || 'Tạo sự kiện thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link to="/organizer" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tạo sự kiện mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Thông tin cơ bản</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện *</label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required placeholder="Nhập tên sự kiện"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Mô tả chi tiết sự kiện"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục *</label>
              <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white">
                <option value="">Chọn danh mục</option>
                {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>
            </div>
            <LocationPickerMap
              value={{ location: form.location, latitude: form.latitude, longitude: form.longitude }}
              onChange={({ location, latitude, longitude }) =>
                setForm((f) => ({ ...f, location, latitude, longitude }))
              }
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chi tiết địa chỉ
                <span className="ml-2 text-xs font-normal text-gray-400">(tầng, phòng, tòa nhà...)</span>
              </label>
              <input
                type="text"
                value={form.addressDetail}
                onChange={(e) => set('addressDetail', e.target.value)}
                placeholder="Ví dụ: Tầng 3, Phòng 301, Tòa nhà A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày tổ chức *</label>
                <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} required min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ bắt đầu *</label>
                <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Giờ kết thúc *</label>
                <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh thumbnail</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              {previewUrl || form.thumbnail ? (
                <div className="relative mt-1">
                  <img src={previewUrl || form.thumbnail} alt="preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {!uploading && (
                    <button type="button" onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-purple-400 hover:text-purple-500 hover:bg-purple-50 transition-all">
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-sm font-medium">Chọn ảnh từ máy</span>
                  <span className="text-xs">PNG, JPG, WEBP tối đa 10MB</span>
                </button>
              )}
            </div>
          </div>

          {/* Ticket types */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-lg font-semibold text-gray-900">Loại vé</h2>
              <button type="button" onClick={addTicket}
                className="flex items-center gap-2 px-3 py-1.5 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium transition-all">
                <Plus className="w-4 h-4" /> Thêm loại vé
              </button>
            </div>
            <div className="space-y-4">
              {form.ticketTypes.map((t, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Loại vé #{idx + 1}</span>
                    {form.ticketTypes.length > 1 && (
                      <button type="button" onClick={() => removeTicket(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tên *</label>
                      <input type="text" value={t.name} onChange={(e) => setTicket(idx, 'name', e.target.value)} required placeholder="Standard / VIP..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Giá (VND) *</label>
                      <input type="number" value={t.price} onChange={(e) => setTicket(idx, 'price', e.target.value)} required min="0"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Số lượng *</label>
                      <input type="number" value={t.quantity} onChange={(e) => setTicket(idx, 'quantity', e.target.value)} required min="1"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}

          <div className="flex gap-3">
            <Link to="/organizer" className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-50 transition-all">
              Hủy
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang tạo...</> : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

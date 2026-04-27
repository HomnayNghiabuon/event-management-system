import { useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getCommissions, createCommission, updateCommission } from '../../api/admin'
import { TrendingUp, Plus, CheckCircle, X, Loader2 } from 'lucide-react'

export function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ percent: '', effectiveFrom: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getCommissions()
      .then(setCommissions)
      .catch(() => setCommissions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ percent: '', effectiveFrom: '', isActive: true }); setEditId(null); setError(''); setModal(true) }
  const openEdit = (c) => { setForm({ percent: c.percent, effectiveFrom: c.effectiveFrom?.split('T')[0] || '', isActive: c.isActive }); setEditId(c.commissionId); setError(''); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { percent: parseFloat(form.percent), isActive: form.isActive }
      if (form.effectiveFrom) payload.effectiveFrom = form.effectiveFrom + 'T00:00:00Z'
      if (editId) await updateCommission(editId, payload)
      else await createCommission(payload)
      setModal(false)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Thao tác thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Commission</h1>
            <p className="text-gray-500 text-sm mt-1">Cấu hình tỷ lệ hoa hồng hệ thống</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>

        {loading ? <LoadingSpinner /> : commissions.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có cấu hình commission</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((c) => (
              <div key={c.commissionId} className={`bg-white rounded-xl shadow-md p-5 border-l-4 ${c.isActive ? 'border-green-500' : 'border-gray-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl ${c.isActive ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-300'}`}>
                      {c.percent}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 text-lg">{c.percent}% hoa hồng</p>
                        {c.isActive && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" /> Đang áp dụng
                          </span>
                        )}
                      </div>
                      {c.effectiveFrom && (
                        <p className="text-sm text-gray-500">Hiệu lực từ: {new Date(c.effectiveFrom).toLocaleDateString('vi-VN')}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => openEdit(c)}
                    className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium transition-all">
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editId ? 'Cập nhật Commission' : 'Thêm Commission'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tỷ lệ hoa hồng (%) *</label>
                <input type="number" step="0.01" min="0" max="100" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} required
                  placeholder="VD: 10.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hiệu lực từ ngày</label>
                <input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                <p className="text-xs text-gray-400 mt-1">Để trống = áp dụng ngay</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'left-6' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Đang áp dụng</span>
              </label>
              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)}
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

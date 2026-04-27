import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getEventAttendees } from '../../api/events'
import { ArrowLeft, Users, CheckCircle, Clock, Search } from 'lucide-react'

export function EventAttendeesPage() {
  const { id } = useParams()
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getEventAttendees(id)
      .then(setAttendees)
      .catch(() => setAttendees([]))
      .finally(() => setLoading(false))
  }, [id])

  const filtered = attendees.filter((a) =>
    a.attendeeName?.toLowerCase().includes(search.toLowerCase()) ||
    a.ticketTypeName?.toLowerCase().includes(search.toLowerCase())
  )

  const checkedIn = attendees.filter((a) => a.checkinStatus).length

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6">
          <Link to="/organizer" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Danh sách người tham dự</h1>
            {!loading && (
              <div className="flex gap-4 text-sm">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /><span className="font-semibold">{attendees.length}</span> <span className="text-gray-500">tổng</span>
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" /><span className="font-semibold text-green-600">{checkedIn}</span> <span className="text-gray-500">đã check-in</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo tên hoặc loại vé..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{search ? 'Không tìm thấy kết quả' : 'Chưa có người tham dự'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Loại vé</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Check-in lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a) => (
                    <tr key={a.ticketId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{a.attendeeName?.[0] || '?'}</span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{a.attendeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-sm text-gray-600">{a.ticketTypeName}</span></td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${a.checkinStatus ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {a.checkinStatus ? <><CheckCircle className="w-3 h-3" />Checked-in</> : <><Clock className="w-3 h-3" />Chưa check-in</>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {a.checkinTime ? new Date(a.checkinTime).toLocaleString('vi-VN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

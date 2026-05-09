import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getMyTickets } from '../../api/tickets'
import { Calendar, MapPin, Clock, Ticket, CheckCircle, ChevronRight, CalendarX } from 'lucide-react'

export function MySchedulePage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')

  useEffect(() => {
    getMyTickets()
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  // Gom vé theo eventId → danh sách sự kiện duy nhất
  const events = useMemo(() => {
    const map = new Map()
    tickets.forEach((t) => {
      if (!t.eventId) return
      if (!map.has(t.eventId)) {
        map.set(t.eventId, {
          eventId: t.eventId,
          eventTitle: t.eventTitle,
          eventDate: t.eventDate,
          startTime: t.startTime,
          eventLocation: t.eventLocation,
          eventThumbnail: t.eventThumbnail,
          tickets: [],
        })
      }
      map.get(t.eventId).tickets.push(t)
    })
    return Array.from(map.values())
  }, [tickets])

  const todayStr = new Date().toDateString()
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)

  const upcoming = useMemo(() =>
    events
      .filter((e) => e.eventDate && new Date(e.eventDate) >= todayMidnight)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)),
    [events]
  )

  const past = useMemo(() =>
    events
      .filter((e) => !e.eventDate || new Date(e.eventDate) < todayMidnight)
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)),
    [events]
  )

  const displayed = tab === 'upcoming' ? upcoming : past

  // Gom theo tháng để hiển thị separator
  const grouped = useMemo(() => {
    const groups = []
    let curKey = null
    displayed.forEach((e) => {
      const d = e.eventDate ? new Date(e.eventDate) : null
      const key = d ? `${d.getFullYear()}-${d.getMonth()}` : 'unknown'
      const label = d
        ? d.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
        : 'Không rõ ngày'
      if (key !== curKey) {
        groups.push({ key, label, events: [] })
        curKey = key
      }
      groups[groups.length - 1].events.push(e)
    })
    return groups
  }, [displayed])

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Lịch sự kiện của tôi</h1>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { key: 'upcoming', label: 'Sắp diễn ra', count: upcoming.length },
            { key: 'past', label: 'Đã qua', count: past.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <CalendarX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {tab === 'upcoming' ? 'Không có sự kiện nào sắp diễn ra' : 'Chưa có sự kiện nào đã qua'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/" className="mt-4 inline-block text-purple-600 hover:underline text-sm font-medium">
                Khám phá sự kiện →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.key}>
                {/* Month separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {group.label}
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="space-y-3">
                  {group.events.map((event) => {
                    const d = event.eventDate ? new Date(event.eventDate) : null
                    const isToday = d && d.toDateString() === todayStr
                    const isPast = d && d < todayMidnight
                    const allCheckedIn = event.tickets.length > 0 && event.tickets.every((t) => t.checkinStatus)
                    const ticketTypes = [...new Set(event.tickets.map((t) => t.ticketTypeName).filter(Boolean))]

                    return (
                      <div
                        key={event.eventId}
                        onClick={() => navigate(`/my-tickets/${event.tickets[0].ticketId}`)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-all group cursor-pointer"
                      >
                        {/* Date badge */}
                        <div className={`w-[72px] flex-shrink-0 flex flex-col items-center justify-center py-4 ${
                          isToday ? 'bg-green-500' : isPast ? 'bg-gray-100' : 'bg-gradient-to-b from-blue-500 to-purple-600'
                        }`}>
                          {d ? (
                            <>
                              <span className={`text-2xl font-bold leading-none ${!isPast || isToday ? 'text-white' : 'text-gray-500'}`}>
                                {d.getDate()}
                              </span>
                              <span className={`text-[11px] mt-0.5 uppercase font-semibold ${!isPast || isToday ? 'text-white/80' : 'text-gray-400'}`}>
                                {d.toLocaleDateString('vi-VN', { month: 'short' })}
                              </span>
                              <span className={`text-[10px] mt-0.5 ${!isPast || isToday ? 'text-white/60' : 'text-gray-400'}`}>
                                {d.toLocaleDateString('vi-VN', { weekday: 'short' })}
                              </span>
                              {isToday && (
                                <span className="mt-1 text-[9px] font-bold text-white bg-white/20 px-1.5 rounded-full">HÔM NAY</span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">?</span>
                          )}
                        </div>

                        {/* Thumbnail */}
                        {event.eventThumbnail && (
                          <div className="w-20 flex-shrink-0 hidden sm:block">
                            <img src={event.eventThumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 p-4 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className={`font-semibold text-base leading-snug line-clamp-2 ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                              {event.eventTitle || 'Sự kiện'}
                            </h3>
                            {allCheckedIn && (
                              <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" /> Đã check-in
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                            {event.startTime && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-purple-400" />
                                {event.startTime.substring(0, 5)}
                              </span>
                            )}
                            {event.eventLocation && (
                              <span className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{event.eventLocation}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Ticket className="w-3.5 h-3.5 text-purple-400" />
                              {event.tickets.length} vé
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {ticketTypes.map((type) => (
                              <span key={type} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center px-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

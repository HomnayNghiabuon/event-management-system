import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Calendar, Clock, MapPin, ArrowLeft, Ticket as TicketIcon, User } from 'lucide-react'
import { Header } from '../../components/Header'
import { Footer } from '../../components/Footer'
import { BookingFlow } from '../../components/BookingFlow'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getEventById } from '../../api/events'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBooking, setShowBooking] = useState(false)

  useEffect(() => {
    setLoading(true)
    getEventById(id)
      .then(setEvent)
      .catch(() => setError('Không tìm thấy sự kiện'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1"><LoadingSpinner /></div>
      <Footer />
    </div>
  )

  if (error || !event) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600">{error || 'Sự kiện không tồn tại'}</p>
          <Link to="/" className="mt-4 inline-block text-purple-600 hover:underline">← Về trang chủ</Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  const minPrice = event.ticketTypes?.length > 0 ? Math.min(...event.ticketTypes.map((t) => t.price)) : 0
  const date = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      {/* Back button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 lg:gap-8">
          {/* Left: Info */}
          <div className="space-y-6">
            {/* Image */}
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg bg-gray-100">
              {event.thumbnail ? (
                <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                  <span className="text-8xl">🎫</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{event.title}</h1>

            {/* Category badge */}
            {event.category && (
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {event.category}
              </span>
            )}

            {/* Info box */}
            <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Thông tin sự kiện</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div><p className="text-xs text-gray-500">Ngày</p><p className="font-semibold">{date}</p></div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div><p className="text-xs text-gray-500">Giờ</p><p className="font-semibold">{event.startTime} – {event.endTime}</p></div>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <div><p className="text-xs text-gray-500">Địa điểm</p><p className="font-semibold">{event.location}</p></div>
                </div>
                {event.organizer && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div><p className="text-xs text-gray-500">Organizer</p><p className="font-semibold">{event.organizer.name}</p></div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Về sự kiện này</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>

            {/* Tickets - mobile */}
            <div className="lg:hidden bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loại vé</h2>
              <div className="space-y-3">
                {event.ticketTypes?.map((t) => (
                  <div key={t.ticketTypeId} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <p className="font-bold text-purple-600">{t.price === 0 ? 'Miễn phí' : VND.format(t.price)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Còn {t.quantity} vé</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking panel (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Đặt vé</h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Giá từ</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {minPrice === 0 ? 'Miễn phí' : VND.format(minPrice)}
                </p>
              </div>
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Loại vé</h3>
                {event.ticketTypes?.map((t) => (
                  <div key={t.ticketTypeId} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{t.name}</h4>
                      <p className="text-base font-bold text-purple-600">{t.price === 0 ? 'Miễn phí' : VND.format(t.price)}</p>
                    </div>
                    <p className="text-xs text-gray-500">Còn {t.quantity} vé</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowBooking(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-5 h-5" /> Đặt vé ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Giá từ</p>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {minPrice === 0 ? 'Miễn phí' : VND.format(minPrice)}
            </p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
          >
            <TicketIcon className="w-5 h-5" /> Đặt vé
          </button>
        </div>
      </div>

      <div className="pb-20 lg:pb-0" />
      <Footer />

      {showBooking && (
        <BookingFlow
          eventTitle={event.title}
          ticketTypes={event.ticketTypes || []}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  )
}

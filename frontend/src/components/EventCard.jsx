import { MapPin, Calendar } from 'lucide-react'
import { Link } from 'react-router'

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export function EventCard({ event }) {
  const price = event.minPrice != null ? VND.format(event.minPrice) : 'Miễn phí'
  const date = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 lg:hover:-translate-y-2 overflow-hidden group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {event.thumbnail ? (
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-4xl">🎫</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          {event.category || 'Sự kiện'}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs sm:text-sm text-gray-500">Từ</span>
          <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {price}
          </div>
        </div>

        <div className="hidden sm:flex gap-2">
          <Link
            to={`/event/${event.eventId}`}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm text-center"
          >
            Chi tiết
          </Link>
          <Link
            to={`/event/${event.eventId}`}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm text-center"
          >
            Đặt vé
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:hidden">
          <Link
            to={`/event/${event.eventId}`}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-sm text-center"
          >
            Đặt vé
          </Link>
        </div>
      </div>
    </div>
  )
}

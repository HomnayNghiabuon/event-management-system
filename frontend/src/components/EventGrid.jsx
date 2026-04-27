import { EventCard } from './EventCard'

export function EventGrid({ events }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-500 text-base sm:text-lg">Không tìm thấy sự kiện. Hãy thử điều chỉnh bộ lọc.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {events.map((event) => (
        <EventCard key={event.eventId} event={event} />
      ))}
    </div>
  )
}

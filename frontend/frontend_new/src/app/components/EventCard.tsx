import { MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router';

export interface Event {
  id: number;
  name: string;
  location: string;
  price: string;
  image: string;
  category: string;
  date: string;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 lg:hover:-translate-y-2 overflow-hidden group">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
          {event.category}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem]">
          {event.name}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-xs sm:text-sm text-gray-500">From</span>
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {event.price}
          </div>
        </div>

        {/* Action Buttons - Responsive Layout */}
        {/* Desktop/Tablet: Side by side */}
        <div className="hidden sm:flex gap-2">
          <Link
            to={`/event/${event.id}`}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm text-center"
          >
            View Details
          </Link>
          <Link
            to={`/event/${event.id}`}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm text-center"
          >
            Book Ticket
          </Link>
        </div>

        {/* Mobile: Stacked vertically */}
        <div className="flex flex-col gap-2 sm:hidden">
          <Link
            to={`/event/${event.id}`}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm text-center"
          >
            Book Ticket
          </Link>
          <Link
            to={`/event/${event.id}`}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-sm text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
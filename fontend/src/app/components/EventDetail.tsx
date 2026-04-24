import { Calendar, Clock, MapPin, ArrowLeft, Ticket as TicketIcon } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { BookingFlow } from './BookingFlow';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface EventDetailProps {
  id: string;
  title: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  ticketTypes: TicketType[];
}

export function EventDetail({
  title,
  image,
  date,
  startTime,
  endTime,
  location,
  description,
  ticketTypes,
}: EventDetailProps) {
  const lowestPrice = Math.min(...ticketTypes.map(t => t.price));
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại danh sách</span>
          </Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 lg:gap-8">
          {/* Left Column - Event Information */}
          <div className="space-y-6">
            {/* Event Image */}
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </h1>

            {/* Event Info */}
            <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin sự kiện</h2>

              <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Ngày</p>
                    <p className="text-base font-semibold">{date}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Thời gian</p>
                    <p className="text-base font-semibold">{startTime} - {endTime}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Địa điểm</p>
                    <p className="text-base font-semibold">{location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Giới thiệu sự kiện</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Ticket Types - Mobile/Tablet View */}
            <div className="lg:hidden bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loại vé có sẵn</h2>
              <div className="space-y-4">
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                      <p className="text-lg font-bold text-purple-600">
                        {ticket.price.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Booking Panel (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Đặt vé ngay</h2>

              {/* Lowest Price Highlight */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Giá từ</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {lowestPrice.toLocaleString('vi-VN')} VND
                </p>
              </div>

              {/* Ticket Types */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Loại vé có sẵn
                </h3>
                {ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{ticket.name}</h4>
                      <p className="text-base font-bold text-purple-600">
                        {ticket.price.toLocaleString('vi-VN')} VND
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">{ticket.description}</p>
                  </div>
                ))}
              </div>

              {/* Book Button */}
              <button
                onClick={() => setShowBookingFlow(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <TicketIcon className="w-5 h-5" />
                Đặt vé ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Giá từ</p>
            <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {lowestPrice.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <button
            onClick={() => setShowBookingFlow(true)}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <TicketIcon className="w-5 h-5" />
            Đặt vé
          </button>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <BookingFlow
          eventTitle={title}
          ticketTypes={ticketTypes}
          onClose={() => setShowBookingFlow(false)}
        />
      )}
    </div>
  );
}
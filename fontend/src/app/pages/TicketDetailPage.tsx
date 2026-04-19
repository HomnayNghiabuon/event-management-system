import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Search, QrCode, Ticket as TicketIcon, X } from 'lucide-react';
import { Link } from 'react-router';

// Mock ticket data
const mockTickets = {
  '123456789012': [
    {
      id: 'TKT001',
      eventName: 'Summer Music Festival 2026',
      eventDate: '2026-06-15',
      eventTime: '18:00 - 23:00',
      location: 'National Stadium, Ho Chi Minh City',
      ticketType: 'VIP',
      price: 500000,
      status: 'active',
    },
    {
      id: 'TKT002',
      eventName: 'Tech Workshop: AI & Machine Learning',
      eventDate: '2026-05-20',
      eventTime: '09:00 - 17:00',
      location: 'Innovation Hub, District 1',
      ticketType: 'Regular',
      price: 200000,
      status: 'used',
    },
  ],
  '987654321098': [
    {
      id: 'TKT003',
      eventName: 'K-Pop Fan Meeting 2026',
      eventDate: '2026-07-10',
      eventTime: '19:00 - 22:00',
      location: 'Convention Center, Hanoi',
      ticketType: 'VIP',
      price: 800000,
      status: 'cancelled',
    },
  ],
};

interface Ticket {
  id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  ticketType: string;
  price: number;
  status: 'active' | 'used' | 'cancelled';
}

export function TicketDetailPage() {
  const [cccd, setCccd] = useState('');
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleSearch = () => {
    setError('');
    setTickets(null);
    setHasSearched(false);

    // Validate CCCD
    if (!cccd) {
      setError('Please enter your CCCD number');
      return;
    }

    if (!/^\d{12}$/.test(cccd)) {
      setError('CCCD must be exactly 12 digits');
      return;
    }

    // Search for tickets
    const foundTickets = mockTickets[cccd as keyof typeof mockTickets];
    setTickets(foundTickets || []);
    setHasSearched(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'used':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'used':
        return 'Used';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Ticket</h1>
              <p className="text-gray-600">Enter your CCCD number to view your tickets</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={cccd}
                    onChange={(e) => {
                      setCccd(e.target.value);
                      setError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    placeholder="Enter your ID number (CCCD)"
                    maxLength={12}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                    } focus:ring-2 focus:border-transparent transition-all`}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
                >
                  Search Ticket
                </button>
              </div>
            </div>
          </div>

          {/* No Tickets Found */}
          {hasSearched && tickets?.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <TicketIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Tickets Found</h2>
              <p className="text-gray-600 mb-6">
                You have not purchased any tickets. Please buy a ticket first.
              </p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                Buy Ticket
              </Link>
            </div>
          )}

          {/* Ticket List */}
          {hasSearched && tickets && tickets.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Tickets</h2>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{ticket.eventName}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {getStatusText(ticket.status)}
                        </span>
                      </div>
                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Date:</span>
                          {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Time:</span>
                          {ticket.eventTime}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Location:</span>
                          {ticket.location}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                            {ticket.ticketType}
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {ticket.price.toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
                    >
                      View Ticket Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Ticket Information */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Event Name</h3>
                    <p className="text-lg font-semibold text-gray-900">{selectedTicket.eventName}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Event Time</h3>
                    <p className="text-gray-900">{selectedTicket.eventTime}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedTicket.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p className="text-gray-900">{selectedTicket.location}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ticket Type</h3>
                    <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                      {selectedTicket.ticketType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ticket Price</h3>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedTicket.price.toLocaleString('vi-VN')} VND
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ticket Status</h3>
                    <span
                      className={`inline-block px-4 py-2 rounded-lg font-medium border ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {getStatusText(selectedTicket.status)}
                    </span>
                  </div>
                </div>

                {/* Right: QR Code */}
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 md:min-w-[280px]">
                  <div className="bg-white p-4 rounded-xl shadow-md mb-4">
                    <div className="w-48 h-48 bg-white flex items-center justify-center">
                      <QrCode className="w-full h-full text-gray-900" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Scan this QR code at the event entrance
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">ID: {selectedTicket.id}</p>
                </div>
              </div>

              {selectedTicket.status === 'active' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 text-center">
                    ✓ This ticket is valid and ready to use
                  </p>
                </div>
              )}

              {selectedTicket.status === 'used' && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">This ticket has already been used</p>
                </div>
              )}

              {selectedTicket.status === 'cancelled' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 text-center">
                    This ticket has been cancelled and is no longer valid
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

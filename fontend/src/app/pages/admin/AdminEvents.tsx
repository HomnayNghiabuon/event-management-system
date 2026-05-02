import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, CheckCircle2, XCircle, Search, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  status: 'pending' | 'approved' | 'rejected';
  image: string;
  description: string;
  ticketTypes: { name: string; price: number }[];
}

const mockPendingEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Hội Thảo Digital Marketing 2026',
    date: '2026-08-15',
    time: '09:00 - 17:00',
    location: 'Saigon Innovation Hub, TP.HCM',
    organizer: 'MarketingVietnam Co.',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
    description: 'Sự kiện chia sẻ kiến thức chuyên sâu về Digital Marketing từ các chuyên gia hàng đầu.',
    ticketTypes: [
      { name: 'Vé Tiêu Chuẩn', price: 500000 },
      { name: 'Vé VIP', price: 1500000 }
    ]
  },
  {
    id: 'evt-002',
    title: 'Indie Music Fest - Mùa Thu',
    date: '2026-09-20',
    time: '18:00 - 23:30',
    location: 'Công viên Thanh Xuân, Hà Nội',
    organizer: 'Indie Records',
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop',
    description: 'Đêm nhạc Indie lớn nhất mùa thu với sự tham gia của các ban nhạc trẻ đình đám.',
    ticketTypes: [
      { name: 'Vé Đứng (Early Bird)', price: 300000 },
      { name: 'Vé Đứng (Standard)', price: 400000 }
    ]
  }
];

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>(mockPendingEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const navigate = useNavigate();

  const handleApprove = (id: string) => {
    // In real app: call API to approve
    setEvents(events.filter(e => e.id !== id));
    setSelectedEvent(null);
    // Auto navigate to categories page after approval as per requirements
    setTimeout(() => {
      navigate('/admin/categories');
    }, 500);
  };

  const handleReject = () => {
    if (!selectedEvent) return;
    // In real app: call API to reject
    setEvents(events.filter(e => e.id !== selectedEvent.id));
    setShowRejectModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Duyệt sự kiện</h1>
          <p className="text-gray-500 font-medium">Quản lý và phê duyệt các sự kiện đang chờ</p>
        </div>
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all shadow-sm"
            placeholder="Tìm kiếm sự kiện..."
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sự kiện</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người tạo</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-semibold text-gray-900">Không có sự kiện chờ duyệt</p>
                      <p className="text-sm mt-1">Tất cả sự kiện đã được xử lý</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-16">
                          <img className="h-12 w-16 rounded-lg object-cover shadow-sm border border-gray-100" src={event.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{event.date}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{event.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{event.organizer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        Chờ duyệt
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedEvent(event)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors font-semibold"
                      >
                        <Eye className="w-4 h-4" /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && !showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết sự kiện</h2>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-64 object-cover rounded-lg shadow-sm mb-6 border border-gray-100"
                />
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{selectedEvent.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Ngày tổ chức</p>
                      <p className="font-bold">{selectedEvent.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Thời gian</p>
                      <p className="font-bold">{selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 md:col-span-2">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                      <MapPin className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Địa điểm</p>
                      <p className="font-bold">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2">Mô tả sự kiện</h4>
                  <p className="text-gray-600 leading-relaxed font-medium">{selectedEvent.description}</p>
                </div>

                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-blue-500" /> Loại vé
                  </h4>
                  <div className="space-y-3">
                    {selectedEvent.ticketTypes.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
                        <span className="font-semibold text-gray-800">{ticket.name}</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{ticket.price.toLocaleString('vi-VN')} VND</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => handleApprove(selectedEvent.id)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3.5 px-4 rounded-lg font-bold hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Duyệt sự kiện
                  </button>
                  <button 
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 bg-white border border-gray-300 text-gray-700 py-3.5 px-4 rounded-lg font-bold hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Từ chối
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center border border-gray-100"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Từ chối sự kiện?</h3>
              <p className="text-gray-500 font-medium mb-6">Bạn có chắc chắn muốn từ chối sự kiện này? Hành động này không thể hoàn tác.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleReject}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-md transition-all"
                >
                  Từ chối
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
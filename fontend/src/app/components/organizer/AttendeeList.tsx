import { useState } from 'react';
import { Send, Users } from 'lucide-react';

interface Attendee {
  id: string;
  fullName: string;
  cccd: string;
  ticketType: string;
  quantity: number;
  email: string;
}

const mockEvents = [
  { id: '1', title: 'Lễ Hội Âm Nhạc Mùa Hè 2026' },
  { id: '2', title: 'Hội Thảo Công Nghệ: AI & Machine Learning' },
  { id: '3', title: 'Họp Fan K-Pop 2026' },
];

const mockAttendees: { [key: string]: Attendee[] } = {
  '1': [
    {
      id: '1',
      fullName: 'Nguyen Van A',
      cccd: '123456789012',
      ticketType: 'VIP',
      quantity: 2,
      email: 'nguyenvana@vidu.com',
    },
    {
      id: '2',
      fullName: 'Tran Thi B',
      cccd: '987654321098',
      ticketType: 'Thường',
      quantity: 1,
      email: 'tranthib@vidu.com',
    },
    {
      id: '3',
      fullName: 'Le Van C',
      cccd: '456789012345',
      ticketType: 'VIP',
      quantity: 3,
      email: 'levanc@vidu.com',
    },
  ],
  '2': [
    {
      id: '4',
      fullName: 'Pham Thi D',
      cccd: '321098765432',
      ticketType: 'Thường',
      quantity: 1,
      email: 'phamthid@vidu.com',
    },
  ],
  '3': [],
};

export function AttendeeList() {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [emailContent, setEmailContent] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    setAttendees(mockAttendees[eventId] || []);
    setSelectedAttendees(new Set());
    setShowEmailForm(false);
    setEmailContent('');
  };

  const toggleSelectAll = () => {
    if (selectedAttendees.size === attendees.length) {
      setSelectedAttendees(new Set());
    } else {
      setSelectedAttendees(new Set(attendees.map((a) => a.id)));
    }
  };

  const toggleSelectAttendee = (id: string) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAttendees(newSelected);
  };

  const handleSendEmail = async () => {
    if (!emailContent.trim() || selectedAttendees.size === 0) return;

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setShowSuccess(true);
    setEmailContent('');
    setSelectedAttendees(new Set());
    setShowEmailForm(false);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            Đã gửi email thành công cho {selectedAttendees.size} người tham dự!
          </p>
        </div>
      )}

      {/* Event Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Chọn Sự Kiện</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => handleEventSelect(event.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedEvent === event.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {mockAttendees[event.id]?.length || 0} người tham dự
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Attendee List */}
      {selectedEvent && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 break-words whitespace-normal inline-block max-w-full">
                Danh Sách Người Tham Dự
              </h2>
              <p className="text-sm text-gray-600 block mt-1">
                Đã có {attendees.length} người đăng ký
              </p>
            </div>
            {attendees.length > 0 && (
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium"
              >
                <Send className="w-4 h-4" />
                Gửi Email
              </button>
            )}
          </div>

          {attendees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Chưa có người đăng ký</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedAttendees.size === attendees.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CCCD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại Vé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Lượng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendees.map((attendee) => (
                      <tr
                        key={attendee.id}
                        className={`transition-colors ${
                          selectedAttendees.has(attendee.id) ? 'bg-purple-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.has(attendee.id)}
                            onChange={() => toggleSelectAttendee(attendee.id)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium text-gray-900">{attendee.fullName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900 font-mono">{attendee.cccd}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {attendee.ticketType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{attendee.quantity}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-gray-900">{attendee.email}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Email Form */}
              {showEmailForm && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="max-w-2xl">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Gửi Email cho {selectedAttendees.size} người tham dự đã chọn
                    </h3>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={6}
                      placeholder="Nhập nội dung thông báo..."
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleSendEmail}
                        disabled={!emailContent.trim() || selectedAttendees.size === 0 || isSending}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSending ? 'Đang gửi...' : 'Gửi Email'}
                      </button>
                      <button
                        onClick={() => setShowEmailForm(false)}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                      >
                        Hủy Bỏ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

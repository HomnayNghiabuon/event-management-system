import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Ticket, DollarSign } from 'lucide-react';

const mockEvents = [
  { id: '1', title: 'Lễ Hội Âm Nhạc Mùa Hè 2026', totalTickets: 500 },
  { id: '2', title: 'Hội Thảo Công Nghệ: AI & Machine Learning', totalTickets: 150 },
  { id: '3', title: 'Họp Fan K-Pop 2026', totalTickets: 400 },
];

const mockReports: { [key: string]: any } = {
  '1': {
    ticketsSold: 450,
    ticketsRemaining: 50,
    totalRevenue: 190000000,
    regularSold: 250,
    vipSold: 200,
  },
  '2': {
    ticketsSold: 120,
    ticketsRemaining: 30,
    totalRevenue: 30000000,
    regularSold: 100,
    vipSold: 20,
  },
  '3': {
    ticketsSold: 380,
    ticketsRemaining: 20,
    totalRevenue: 136000000,
    regularSold: 180,
    vipSold: 200,
  },
};

export function TicketReports() {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [report, setReport] = useState<any>(null);

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
    setReport(mockReports[eventId]);
  };

  const chartData = report
    ? [
        { name: 'Vé Đã Bán', value: report.ticketsSold },
        { name: 'Vé Còn Lại', value: report.ticketsRemaining },
      ]
    : [];

  const ticketTypeData = report
    ? [
        { name: 'Thường', 'Đã Bán': report.regularSold },
        { name: 'VIP', 'Đã Bán': report.vipSold },
      ]
    : [];

  return (
    <div className="space-y-6">
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
              <p className="text-sm text-gray-600 mt-1">Tổng cộng: {event.totalTickets} vé</p>
            </button>
          ))}
        </div>
      </div>

      {/* Report Dashboard */}
      {report && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Vé Đã Bán</h3>
              <p className="text-3xl font-bold text-gray-900">{report.ticketsSold}</p>
              <p className="text-xs text-gray-500 mt-2">
                {((report.ticketsSold / (report.ticketsSold + report.ticketsRemaining)) * 100).toFixed(1)}% đã bán
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Vé Còn Lại</h3>
              <p className="text-3xl font-bold text-gray-900">{report.ticketsRemaining}</p>
              <p className="text-xs text-gray-500 mt-2">Sẵn sàng để bán</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm mb-1">Tổng Doanh Thu</h3>
              <p className="text-3xl font-bold text-gray-900">
                {(report.totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-2">VNĐ</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets Sold vs Remaining */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tổng Quan Bán Vé</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} name="Số lượng" />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Ticket Type Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Phân Bổ Loại Vé</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Đã Bán" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Chi Tiết Doanh Thu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại Vé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số Lượng Đã Bán
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá (VNĐ)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh Thu (VNĐ)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Thường
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.regularSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">200.000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(report.regularSold * 200000).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        VIP
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.vipSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">500.000</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(report.vipSold * 500000).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900" colSpan={3}>
                      Tổng Doanh Thu
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-green-600">
                      {report.totalRevenue.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

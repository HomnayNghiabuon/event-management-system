import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import { TrendingUp, Users, Ticket as TicketIcon, Calendar, DollarSign, Activity } from 'lucide-react';

const revenueData = [
  { name: 'T1', total: 120000000 },
  { name: 'T2', total: 150000000 },
  { name: 'T3', total: 180000000 },
  { name: 'T4', total: 220000000 },
  { name: 'T5', total: 300000000 },
  { name: 'T6', total: 280000000 },
  { name: 'T7', total: 350000000 },
];

const ticketData = [
  { name: 'Live Concert', sold: 4000, unsold: 1000 },
  { name: 'Workshop', sold: 3000, unsold: 1500 },
  { name: 'Fan Meeting', sold: 2000, unsold: 500 },
  { name: 'Hội thảo', sold: 2780, unsold: 800 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">Báo cáo hoạt động mới nhất của nền tảng BuyTicket</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Hôm nay: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1.6B VNĐ</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp className="w-4 h-4" /> +12.5%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">Tổng số sự kiện</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">124</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp className="w-4 h-4" /> +5.2%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">Tổng vé đã bán</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">11,780</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp className="w-4 h-4" /> +18.7%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <TicketIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">Người tổ chức</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">45</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded">
                <TrendingUp className="w-4 h-4" /> +2 mới
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Biểu đồ doanh thu</h3>
              <p className="text-sm text-gray-500 font-medium">Theo tháng (Năm 2026)</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart id="revenue-chart" data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs key="revenue-defs">
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid key="revenue-grid" strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  key="revenue-xaxis"
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  key="revenue-yaxis"
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                  tickFormatter={(value) => `${(value / 1000000)}M`}
                  dx={-10}
                />
                <Tooltip 
                  key="revenue-tooltip"
                  cursor={false}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 600 }}
                  formatter={(value: number) => [`${value.toLocaleString()} VNĐ`, 'Doanh thu']}
                />
                <Area 
                  key="revenue-area"
                  isAnimationActive={false}
                  type="monotone" 
                  dataKey="total" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Sales Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900">Thống kê vé</h3>
            <p className="text-sm text-gray-500 font-medium">Theo danh mục sự kiện</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart id="ticket-chart" data={ticketData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={16}>
                <CartesianGrid key="ticket-grid" strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis key="ticket-xaxis" type="number" hide />
                <YAxis 
                  key="ticket-yaxis"
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }}
                  width={90}
                />
                <Tooltip 
                  key="ticket-tooltip"
                  cursor={false}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                />
                <Legend 
                  key="ticket-legend"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }} 
                  iconType="circle"
                />
                <Bar key="ticket-bar1" isAnimationActive={false} dataKey="sold" name="Đã bán" stackId="a" fill="#3b82f6" />
                <Bar key="ticket-bar2" isAnimationActive={false} dataKey="unsold" name="Chưa bán" stackId="a" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
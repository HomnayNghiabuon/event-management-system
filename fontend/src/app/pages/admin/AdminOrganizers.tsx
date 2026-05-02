import { useState } from 'react';
import { Eye, Shield, ShieldAlert, Trash2, Search, CheckCircle2, User as UserIcon, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Organizer {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'active' | 'locked';
  phone: string;
  address: string;
  joinDate: string;
  lastLogin: string;
  eventCount: number;
}

const mockOrganizers: Organizer[] = [
  {
    id: 'org-001',
    email: 'contact@marketingvietnam.vn',
    name: 'MarketingVietnam Co.',
    status: 'active',
    phone: '0901234567',
    address: '123 Lê Lợi, Quận 1, TP.HCM',
    joinDate: '2026-01-15',
    lastLogin: '2026-04-20 14:30',
    eventCount: 12
  },
  {
    id: 'org-002',
    email: 'hello@indierecords.com',
    name: 'Indie Records',
    status: 'pending',
    phone: '0912345678',
    address: '456 Hai Bà Trưng, Hoàn Kiếm, Hà Nội',
    joinDate: '2026-04-25',
    lastLogin: 'Chưa đăng nhập',
    eventCount: 0
  },
  {
    id: 'org-003',
    email: 'info@kpopstar.net',
    name: 'K-Pop Star Entertainment',
    status: 'locked',
    phone: '0987654321',
    address: '789 Nguyễn Văn Linh, Đà Nẵng',
    joinDate: '2025-11-10',
    lastLogin: '2026-03-01 09:15',
    eventCount: 3
  }
];

export function AdminOrganizers() {
  const [organizers, setOrganizers] = useState<Organizer[]>(mockOrganizers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);

  const filteredOrganizers = organizers.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (id: string, currentStatus: 'pending' | 'active' | 'locked') => {
    setOrganizers(organizers.map(org => {
      if (org.id === id) {
        if (currentStatus === 'pending') return { ...org, status: 'active' };
        if (currentStatus === 'active') return { ...org, status: 'locked' };
        if (currentStatus === 'locked') return { ...org, status: 'active' };
      }
      return org;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">Hoạt động</span>;
      case 'pending':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200">Chờ duyệt</span>;
      case 'locked':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">Bị khóa</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Người tổ chức</h1>
          <p className="text-gray-500 font-medium">Quản lý tài khoản Organizer trên hệ thống</p>
        </div>
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all shadow-sm"
            placeholder="Tìm theo tên, email..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tổ chức / Email</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tham gia</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Số sự kiện</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredOrganizers.map((org) => (
                <tr key={org.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                        {org.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{org.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(org.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm font-semibold text-gray-900">{org.joinDate}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Đăng nhập: {org.lastLogin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell text-sm font-bold text-gray-700">
                    {org.eventCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrg(org)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {org.status === 'pending' && (
                        <button 
                          onClick={() => toggleStatus(org.id, 'pending')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Duyệt tài khoản"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      {org.status === 'active' && (
                        <button 
                          onClick={() => toggleStatus(org.id, 'active')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Khóa tài khoản"
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                      )}
                      
                      {org.status === 'locked' && (
                        <button 
                          onClick={() => toggleStatus(org.id, 'locked')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mở khóa tài khoản"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      )}
                      
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrg && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-gray-900">Hồ sơ nhà tổ chức</h2>
                <button 
                  onClick={() => setSelectedOrg(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <Eye className="w-6 h-6 hidden" /> ✕
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-blue-500/20">
                    {selectedOrg.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedOrg.name}</h3>
                    <p className="text-gray-500 font-medium mb-3 flex items-center gap-1">
                      <span className="font-mono text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">ID: {selectedOrg.id}</span>
                    </p>
                    {getStatusBadge(selectedOrg.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2 mb-4 text-gray-400">
                      <UserIcon className="w-4 h-4" /> Thông tin liên hệ
                    </h4>
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">Email</p>
                        <p className="font-bold text-gray-900">{selectedOrg.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">Số điện thoại</p>
                        <p className="font-bold text-gray-900">{selectedOrg.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-0.5">Địa chỉ trụ sở</p>
                        <p className="font-bold text-gray-900">{selectedOrg.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2 mb-4 text-gray-400">
                      <Calendar className="w-4 h-4" /> Hoạt động
                    </h4>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Ngày tham gia</p>
                      <p className="font-bold text-gray-900 mb-3">{selectedOrg.joinDate}</p>
                      
                      <p className="text-xs text-gray-500 font-semibold mb-1">Lần đăng nhập cuối</p>
                      <p className="font-bold text-gray-900 mb-3">{selectedOrg.lastLogin}</p>
                      
                      <p className="text-xs text-gray-500 font-semibold mb-1">Sự kiện đã tạo</p>
                      <p className="text-2xl font-black text-blue-600">{selectedOrg.eventCount}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100 justify-end">
                  {selectedOrg.status === 'pending' && (
                    <button 
                      onClick={() => { toggleStatus(selectedOrg.id, 'pending'); setSelectedOrg(null); }}
                      className="bg-green-600 text-white py-2.5 px-6 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Duyệt tài khoản
                    </button>
                  )}
                  {selectedOrg.status === 'active' && (
                    <button 
                      onClick={() => { toggleStatus(selectedOrg.id, 'active'); setSelectedOrg(null); }}
                      className="bg-orange-100 text-orange-700 py-2.5 px-6 rounded-lg font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldAlert className="w-5 h-5" /> Khóa tài khoản
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
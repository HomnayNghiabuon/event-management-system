import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Users,
  BarChart3,
  ScanLine,
  LogOut,
  Menu,
  X,
  Ticket,
} from 'lucide-react';
import { EventManagement } from '../components/organizer/EventManagement';
import { AttendeeList } from '../components/organizer/AttendeeList';
import { TicketReports } from '../components/organizer/TicketReports';
import { CheckInTicket } from '../components/organizer/CheckInTicket';

type Section = 'events' | 'attendees' | 'reports' | 'checkin';

export function OrganizerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>('events');

  const handleLogout = () => {
    navigate('/');
  };

  const menuItems = [
    { id: 'events' as Section, label: 'Quản Lý Sự Kiện', icon: Calendar },
    { id: 'attendees' as Section, label: 'Danh Sách Người Tham Dự', icon: Users },
    { id: 'reports' as Section, label: 'Báo Cáo Vé', icon: BarChart3 },
    { id: 'checkin' as Section, label: 'Kiểm Tra Vé (Check-in)', icon: ScanLine },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'events':
        return <EventManagement />;
      case 'attendees':
        return <AttendeeList />;
      case 'reports':
        return <TicketReports />;
      case 'checkin':
        return <CheckInTicket />;
      default:
        return <EventManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  BuyTicket
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-left leading-tight ${
                  activeSection === item.id
                    ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-normal">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Đăng Xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {menuItems.find((item) => item.id === activeSection)?.label}
                  </h1>
                  <p className="text-sm text-gray-600">Quản lý sự kiện và người tham dự của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">Ban Tổ Chức</p>
                  <p className="text-xs text-gray-600">organizer@buyticket.com</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">O</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">{renderSection()}</div>
      </main>
    </div>
  );
}

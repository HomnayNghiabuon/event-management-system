import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Ticket, Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
    setDropdownOpen(false)
  }

  const roleLabel = { ADMIN: 'Admin', ORGANIZER: 'Organizer', ATTENDEE: 'Attendee' }

  const navLinks = user
    ? user.role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/events', label: 'Duyệt sự kiện' },
          { to: '/admin/organizers', label: 'Organizer' },
          { to: '/admin/categories', label: 'Danh mục' },
          { to: '/admin/commissions', label: 'Commission' },
        ]
      : user.role === 'ORGANIZER'
      ? [
          { to: '/organizer', label: 'Sự kiện của tôi' },
          { to: '/organizer/events/create', label: 'Tạo sự kiện' },
          { to: '/organizer/checkin', label: 'Check-in' },
        ]
      : [
          { to: '/', label: 'Trang chủ' },
          { to: '/my-tickets', label: 'Vé của tôi' },
          { to: '/my-orders', label: 'Đơn hàng' },
        ]
    : [{ to: '/', label: 'Trang chủ' }]

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BuyTicket
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/notifications" className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all">
                    <Bell className="w-5 h-5" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {user.fullName?.[0] || user.email?.[0] || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium max-w-[120px] truncate">
                        {user.fullName || user.email}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                        {roleLabel[user.role]}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" />
                          Hồ sơ của tôi
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium text-sm"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all font-medium text-sm"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-[45]" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed right-0 top-0 w-72 h-full bg-white shadow-2xl z-[55]">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && (
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                <p className="font-semibold text-gray-900 truncate">{user.fullName || user.email}</p>
                <p className="text-sm text-purple-600">{roleLabel[user.role]}</p>
              </div>
            )}

            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link to="/notifications" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg">
                    Thông báo
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg">
                    Hồ sơ của tôi
                  </Link>
                </>
              )}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full px-5 py-3 text-center text-purple-600 border border-purple-600 rounded-lg font-medium">
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full px-5 py-3 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

import { Link } from 'react-router'
import { Facebook, Phone, Mail, MapPin, Ticket } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white mt-12 sm:mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-xl">BuyTicket</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm">
              Nền tảng đặt vé sự kiện hàng đầu. Tìm kiếm và đặt vé hòa nhạc, workshop, fan meeting dễ dàng.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-blue-500 flex items-center justify-center transition-all duration-300 hover:-translate-y-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 2.237.738 4.303 1.986 5.97L2.05 21.95l4.03-1.965A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm3.5 13h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0-3h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zm0-3h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">123 Nguyễn Huệ, Q.1, TP. Hồ Chí Minh</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <p className="text-gray-300">1900-1234</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">support@buyticket.com</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Liên kết nhanh</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">Tìm kiếm sự kiện</Link>
              <Link to="/my-tickets" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">Vé của tôi</Link>
              <Link to="/login" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">Đăng nhập</Link>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-xl">BuyTicket</span>
            </div>
            <p className="text-gray-400 text-sm">Nền tảng đặt vé sự kiện hàng đầu</p>
          </div>
          <div className="text-center space-y-2 text-sm">
            <p className="text-gray-400">Hotline: <span className="text-white">1900-1234</span></p>
            <p className="text-gray-400">Email: <span className="text-white">support@buyticket.com</span></p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; 2026 BuyTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

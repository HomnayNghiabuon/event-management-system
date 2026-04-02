import { useState } from 'react';
import { Ticket, Menu, X } from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BuyTicket
              </span>
            </div>

            {/* Desktop: Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button className="px-5 py-2.5 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium">
                Manager Login
              </button>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium">
                Ticket Detail
              </button>
            </div>

            {/* Mobile: Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors relative z-[60]"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Dark Overlay Background */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-[45]" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div
            className="md:hidden fixed right-0 top-0 w-64 h-full bg-white shadow-2xl z-[55] transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-5 py-3 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-300 font-medium"
              >
                Manager Login
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                Ticket Detail
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
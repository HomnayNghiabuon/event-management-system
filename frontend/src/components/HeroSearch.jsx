import { MapPin, Search } from 'lucide-react'

export function HeroSearch({ selectedLocation, setSelectedLocation, searchQuery, setSearchQuery, onSearch }) {
  const handleSearch = () => {
    if (onSearch) onSearch()
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Tìm Sự Kiện Của Bạn
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá hòa nhạc, workshop và fan meeting tuyệt vời gần bạn
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl shadow-lg p-3">
            <div className="relative flex-1 min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Địa điểm..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <div className="relative flex-[2]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-3 bg-white rounded-xl shadow-lg p-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Địa điểm..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

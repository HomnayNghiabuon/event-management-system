import { MapPin, Search } from 'lucide-react';

interface HeroSearchProps {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch?: () => void;
}

export function HeroSearch({
  selectedLocation,
  setSelectedLocation,
  searchQuery,
  setSearchQuery,
  onSearch,
}: HeroSearchProps) {
  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
    // Scroll to events section
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Find Your Event
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing concerts, workshops, and fan meetings near you
          </p>
        </div>

        {/* Search Bar Container */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop: Single Row */}
          <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl shadow-lg p-3">
            {/* Location Dropdown */}
            <div className="relative flex-1 min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer appearance-none text-gray-700"
              >
                <option value="">All Locations</option>
                <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                <option value="Hanoi">Hanoi</option>
                <option value="Da Nang">Da Nang</option>
                <option value="Can Tho">Can Tho</option>
                <option value="Nha Trang">Nha Trang</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-[2]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Mobile: Stacked Vertically */}
          <div className="sm:hidden space-y-3 bg-white rounded-xl shadow-lg p-4">
            {/* Location Dropdown */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer appearance-none text-gray-700"
              >
                <option value="">All Locations</option>
                <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                <option value="Hanoi">Hanoi</option>
                <option value="Da Nang">Da Nang</option>
                <option value="Can Tho">Can Tho</option>
                <option value="Nha Trang">Nha Trang</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

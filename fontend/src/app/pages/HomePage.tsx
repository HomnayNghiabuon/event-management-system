import { useState } from 'react';
import { Header } from '../components/Header';
import { HeroSearch } from '../components/HeroSearch';
import { CategoryTabs } from '../components/CategoryTabs';
import { EventGrid } from '../components/EventGrid';
import { Footer } from '../components/Footer';
import type { Event } from '../components/EventCard';

// Mock event data
const mockEvents: Event[] = [
  {
    id: 1,
    name: 'Lễ Hội Âm Nhạc Mùa Hè 2026',
    location: 'TP. Hồ Chí Minh',
    price: '1.000.000đ',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hòa nhạc trực tiếp',
    date: '15 Th05, 2026',
  },
  {
    id: 2,
    name: 'Đêm Nhạc K-Pop: Dream Concert',
    location: 'Hà Nội',
    price: '1.200.000đ',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzc0OTc3MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hòa nhạc trực tiếp',
    date: '22 Th05, 2026',
  },
  {
    id: 3,
    name: 'Hội Thảo Digital Marketing',
    location: 'TP. Hồ Chí Minh',
    price: '500.000đ',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hội thảo',
    date: '10 Th04, 2026',
  },
  {
    id: 4,
    name: 'Hội Thảo Lãnh Đạo Doanh Nghiệp',
    location: 'Đà Nẵng',
    price: '800.000đ',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlbWluYXJ8ZW58MXx8fHwxNzc1MDM2MzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hội thảo',
    date: '18 Th04, 2026',
  },
  {
    id: 5,
    name: 'Giao Lưu Với Nghệ Sĩ Nổi Tiếng',
    location: 'TP. Hồ Chí Minh',
    price: '1.500.000đ',
    image: 'https://images.unsplash.com/photo-1741562303714-4bacc4c8ed38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW4lMjBtZWV0aW5nJTIwZXZlbnR8ZW58MXx8fHwxNzc1MDQ0NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Họp fan',
    date: '05 Th05, 2026',
  },
  {
    id: 6,
    name: 'Đêm Nhạc Jazz Trực Tiếp',
    location: 'Hà Nội',
    price: '900.000đ',
    image: 'https://images.unsplash.com/photo-1566735355835-bddb43dc3f63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzc1MDQ0NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hòa nhạc trực tiếp',
    date: '28 Th04, 2026',
  },
  {
    id: 7,
    name: 'Hội Thảo Thiết Kế Sáng Tạo',
    location: 'Cần Thơ',
    price: '600.000đ',
    image: 'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc3NTA0NDY5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hội thảo',
    date: '15 Th04, 2026',
  },
  {
    id: 8,
    name: 'Show Nhạc Điện Tử',
    location: 'Nha Trang',
    price: '1.100.000đ',
    image: 'https://images.unsplash.com/photo-1613093335399-829e30811789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHNob3d8ZW58MXx8fHwxNzc1MDQ0NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hòa nhạc trực tiếp',
    date: '01 Th06, 2026',
  },
  {
    id: 9,
    name: 'Trải Nghiệm DJ Đêm Nhạc',
    location: 'TP. Hồ Chí Minh',
    price: '800.000đ',
    image: 'https://images.unsplash.com/photo-1578185544327-68fca190b2da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc3NTA0NDY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hòa nhạc trực tiếp',
    date: '08 Th05, 2026',
  },
  {
    id: 10,
    name: 'Họp Fan Ban Nhạc Indie',
    location: 'Hà Nội',
    price: '400.000đ',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Họp fan',
    date: '25 Th04, 2026',
  },
  {
    id: 11,
    name: 'Hội Thảo Nhiếp Ảnh',
    location: 'Đà Nẵng',
    price: '550.000đ',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Hội thảo',
    date: '20 Th04, 2026',
  },
  {
    id: 12,
    name: 'Họp Fan Nghệ Sĩ Đặc Biệt',
    location: 'TP. Hồ Chí Minh',
    price: '1.800.000đ',
    image: 'https://images.unsplash.com/photo-1741562303714-4bacc4c8ed38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW4lMjBtZWV0aW5nJTIwZXZlbnR8ZW58MXx8fHwxNzc1MDQ0NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Họp fan',
    date: '12 Th05, 2026',
  },
];

export function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Hòa nhạc trực tiếp');

  // Filter events based on search, location, and category
  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !selectedLocation || event.location === selectedLocation;
    const matchesCategory = event.category === activeCategory;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <Header />

      {/* Hero Search */}
      <HeroSearch
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Category Tabs */}
      <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Main Content */}
      <main className="flex-1 bg-[#F5F7FA]">
        <div id="events-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 text-xl sm:text-2xl font-bold">
              {activeCategory}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Tìm thấy {filteredEvents.length} sự kiện
              {selectedLocation && ` tại ${selectedLocation}`}
            </p>
          </div>

          <EventGrid events={filteredEvents} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

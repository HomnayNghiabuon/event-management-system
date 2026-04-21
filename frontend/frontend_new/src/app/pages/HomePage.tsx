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
    name: 'Summer Music Festival 2026',
    location: 'Ho Chi Minh City',
    price: '$45',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Concert',
    date: 'May 15, 2026',
  },
  {
    id: 2,
    name: 'K-Pop Night: Dream Concert',
    location: 'Hanoi',
    price: '$55',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsJTIwY3Jvd2R8ZW58MXx8fHwxNzc0OTc3MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Concert',
    date: 'May 22, 2026',
  },
  {
    id: 3,
    name: 'Digital Marketing Workshop',
    location: 'Ho Chi Minh City',
    price: '$25',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Workshop',
    date: 'April 10, 2026',
  },
  {
    id: 4,
    name: 'Business Leadership Seminar',
    location: 'Da Nang',
    price: '$35',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHNlbWluYXJ8ZW58MXx8fHwxNzc1MDM2MzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Workshop',
    date: 'April 18, 2026',
  },
  {
    id: 5,
    name: 'Meet & Greet with Famous Artist',
    location: 'Ho Chi Minh City',
    price: '$65',
    image: 'https://images.unsplash.com/photo-1741562303714-4bacc4c8ed38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW4lMjBtZWV0aW5nJTIwZXZlbnR8ZW58MXx8fHwxNzc1MDQ0NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Fan Meeting',
    date: 'May 5, 2026',
  },
  {
    id: 6,
    name: 'Jazz Night Live Performance',
    location: 'Hanoi',
    price: '$40',
    image: 'https://images.unsplash.com/photo-1566735355835-bddb43dc3f63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwcGVyZm9ybWFuY2V8ZW58MXx8fHwxNzc1MDQ0NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Concert',
    date: 'April 28, 2026',
  },
  {
    id: 7,
    name: 'Creative Design Workshop',
    location: 'Can Tho',
    price: '$30',
    image: 'https://images.unsplash.com/photo-1459908676235-d5f02a50184b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzaG9wfGVufDF8fHx8MTc3NTA0NDY5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Workshop',
    date: 'April 15, 2026',
  },
  {
    id: 8,
    name: 'Electronic Music Show',
    location: 'Nha Trang',
    price: '$50',
    image: 'https://images.unsplash.com/photo-1613093335399-829e30811789?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHNob3d8ZW58MXx8fHwxNzc1MDQ0NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Concert',
    date: 'June 1, 2026',
  },
  {
    id: 9,
    name: 'DJ Night Club Experience',
    location: 'Ho Chi Minh City',
    price: '$35',
    image: 'https://images.unsplash.com/photo-1578185544327-68fca190b2da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaiUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc3NTA0NDY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Live Concert',
    date: 'May 8, 2026',
  },
  {
    id: 10,
    name: 'Indie Band Fan Meeting',
    location: 'Hanoi',
    price: '$20',
    image: 'https://images.unsplash.com/photo-1568215425379-7a994872739d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZlJTIwY29uY2VydCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3NTA0NDY5MXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Fan Meeting',
    date: 'April 25, 2026',
  },
  {
    id: 11,
    name: 'Photography Workshop',
    location: 'Da Nang',
    price: '$28',
    image: 'https://images.unsplash.com/photo-1765438863717-49fca900f861?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzUwNDQ2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Workshop',
    date: 'April 20, 2026',
  },
  {
    id: 12,
    name: 'Celebrity Fan Meeting Special',
    location: 'Ho Chi Minh City',
    price: '$75',
    image: 'https://images.unsplash.com/photo-1741562303714-4bacc4c8ed38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW4lMjBtZWV0aW5nJTIwZXZlbnR8ZW58MXx8fHwxNzc1MDQ0NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Fan Meeting',
    date: 'May 12, 2026',
  },
];

export function HomePage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Live Concert');

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
            <h1 className="mb-2 text-xl sm:text-2xl">
              {activeCategory}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
              {selectedLocation && ` in ${selectedLocation}`}
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

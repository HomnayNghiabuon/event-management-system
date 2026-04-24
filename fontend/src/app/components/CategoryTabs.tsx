import { Music, Lightbulb, Users } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const categories = [
  { id: 'Hòa nhạc trực tiếp', name: 'Hòa nhạc trực tiếp', icon: Music },
  { id: 'Hội thảo', name: 'Hội thảo', icon: Lightbulb },
  { id: 'Họp fan', name: 'Họp fan', icon: Users },
];

export function CategoryTabs({ activeCategory, setActiveCategory }: CategoryTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3 Equal Width Tabs */}
        <div className="grid grid-cols-3 gap-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 border-b-3 transition-all duration-300 hover:bg-gray-50 ${
                  isActive
                    ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                    : 'border-transparent text-gray-600 hover:text-purple-500'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm md:text-base text-center leading-tight">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

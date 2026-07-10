import { Music, Lightbulb, Users, Tag } from 'lucide-react'

const ICON_MAP = {
  'Âm nhạc': Music,
  'Music': Music,
  'Workshop': Lightbulb,
  'Fan Meeting': Users,
  'Công nghệ': Lightbulb,
}

export function CategoryTabs({ categories, activeCategoryId, setActiveCategoryId }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all duration-300 whitespace-nowrap text-sm font-medium flex-shrink-0 ${
              activeCategoryId === null
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-gray-600 hover:text-purple-500 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            Tất cả
          </button>
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.name] || Tag
            const isActive = activeCategoryId === cat.categoryId
            return (
              <button
                key={cat.categoryId}
                onClick={() => setActiveCategoryId(cat.categoryId)}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-all duration-300 whitespace-nowrap text-sm font-medium flex-shrink-0 ${
                  isActive
                    ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                    : 'border-transparent text-gray-600 hover:text-purple-500 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

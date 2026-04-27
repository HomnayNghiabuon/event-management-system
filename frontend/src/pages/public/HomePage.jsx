import { useState, useEffect, useCallback } from 'react'
import { Header } from '../../components/Header'
import { HeroSearch } from '../../components/HeroSearch'
import { CategoryTabs } from '../../components/CategoryTabs'
import { EventGrid } from '../../components/EventGrid'
import { Footer } from '../../components/Footer'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { getEvents } from '../../api/events'
import { getCategories } from '../../api/categories'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function HomePage() {
  const [categories, setCategories] = useState([])
  const [events, setEvents] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [appliedLocation, setAppliedLocation] = useState('')

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const fetchEvents = useCallback(() => {
    setLoading(true)
    const params = { page, size: 9 }
    if (activeCategoryId) params.categoryId = activeCategoryId
    if (appliedSearch) params.search = appliedSearch
    if (appliedLocation) params.location = appliedLocation
    getEvents(params)
      .then((data) => {
        setEvents(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [page, activeCategoryId, appliedSearch, appliedLocation])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSearch = () => {
    setAppliedSearch(searchQuery)
    setAppliedLocation(locationQuery)
    setPage(0)
  }

  const handleCategoryChange = (id) => {
    setActiveCategoryId(id)
    setPage(0)
  }

  const activeCategory = categories.find((c) => c.categoryId === activeCategoryId)

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />
      <HeroSearch
        selectedLocation={locationQuery}
        setSelectedLocation={setLocationQuery}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={handleCategoryChange}
      />

      <main className="flex-1 bg-[#F5F7FA]">
        <div id="events-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="mb-6 sm:mb-8">
            <h2 className="mb-2 text-xl sm:text-2xl font-semibold text-gray-900">
              {activeCategory ? activeCategory.name : 'Tất cả sự kiện'}
            </h2>
            {!loading && (
              <p className="text-gray-600 text-sm sm:text-base">
                {events.length === 0 ? 'Không có sự kiện nào' : `Trang ${page + 1} / ${totalPages}`}
              </p>
            )}
          </div>

          {loading ? <LoadingSpinner /> : <EventGrid events={events} />}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = page <= 2 ? i : page - 2 + i
                  if (pg >= totalPages) return null
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${pg === page ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {pg + 1}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { useState, useRef, useCallback } from 'react'
import { MapPin, Search, X, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const DEFAULT_CENTER = [16.0, 106.0] // Trung tâm Việt Nam

// Tạo chuỗi địa chỉ chi tiết từ address components của Nominatim
function formatAddress(addr, fallback = '') {
  if (!addr) return fallback
  const parts = [
    addr.road || addr.pedestrian || addr.footway,
    addr.house_number ? `số ${addr.house_number}` : null,
    addr.neighbourhood || addr.suburb || addr.quarter,
    addr.city_district || addr.district,
    addr.city || addr.town || addr.village || addr.county,
    addr.state,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : fallback
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) })
  return null
}

function MapController({ center }) {
  const map = useMap()
  const prev = useRef(null)
  if (center && center !== prev.current) {
    prev.current = center
    map.flyTo(center, 13, { duration: 0.8 })
  }
  return null
}

function LocationInput({ value, onChange, onSearch }) {
  const [showMap, setShowMap] = useState(false)
  const [position, setPosition] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [locating, setLocating] = useState(false)
  const debounceRef = useRef(null)

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      )
      const data = await res.json()
      return formatAddress(data.address, data.display_name || '')
    } catch { return '' }
  }

  const handleInput = (e) => {
    const q = e.target.value
    onChange(q)
    clearTimeout(debounceRef.current)
    if (q.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=vi&countrycodes=vn`
          )
          setSuggestions(await res.json())
        } catch { setSuggestions([]) }
      }, 500)
    } else {
      setSuggestions([])
    }
  }

  const selectSuggestion = (s) => {
    const lat = parseFloat(s.lat), lng = parseFloat(s.lon)
    const label = formatAddress(s.address, s.display_name)
    onChange(label)
    setPosition([lat, lng])
    setFlyTarget([lat, lng])
    setSuggestions([])
  }

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setPosition([lat, lng])
    const label = await reverseGeocode(lat, lng)
    if (label) { onChange(label); setFlyTarget([lat, lng]) }
  }, [onChange])

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setPosition([latitude, longitude])
        setFlyTarget([latitude, longitude])
        const label = await reverseGeocode(latitude, longitude)
        if (label) onChange(label)
        setLocating(false)
        setShowMap(true)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const clear = () => { onChange(''); setPosition(null); setSuggestions([]) }

  return (
    <div className="relative flex-1 min-w-[200px]">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        placeholder="Địa điểm..."
        value={value}
        onChange={handleInput}
        onFocus={() => value.length >= 2 && suggestions.length === 0 && handleInput({ target: { value } })}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        className="w-full pl-10 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-700"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value && (
          <button type="button" onClick={clear} className="text-gray-400 hover:text-gray-600 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowMap((v) => !v)}
          title="Chọn trên bản đồ"
          className={`p-1 rounded transition-colors ${showMap ? 'text-purple-600' : 'text-gray-400 hover:text-purple-500'}`}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Gợi ý autocomplete */}
      {suggestions.length > 0 && (
        <div className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {suggestions.map((s) => {
            const main = formatAddress(s.address, s.display_name)
            const addr = s.address || {}
            const sub = addr.city || addr.town || addr.state || ''
            return (
              <button
                key={s.place_id}
                type="button"
                onMouseDown={() => selectSuggestion(s)}
                className="w-full px-4 py-2.5 text-left hover:bg-purple-50 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">{main}</p>
                  {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Bản đồ dropdown */}
      {showMap && (
        <div className="absolute z-[999] top-full left-0 mt-1 w-[340px] sm:w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">Click bản đồ để chọn vị trí</span>
            <button
              type="button"
              onClick={handleMyLocation}
              disabled={locating}
              className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-all disabled:opacity-50"
            >
              <Navigation className="w-3 h-3" />
              {locating ? 'Đang xác định...' : 'Vị trí của tôi'}
            </button>
          </div>
          <MapContainer center={position || DEFAULT_CENTER} zoom={position ? 13 : 6} style={{ height: '260px', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {flyTarget && <MapController center={flyTarget} />}
            {position && <Marker position={position} />}
          </MapContainer>
          {value && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-purple-400 flex-shrink-0" /> {value}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
            <LocationInput value={selectedLocation} onChange={setSelectedLocation} onSearch={handleSearch} />
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
            <LocationInput value={selectedLocation} onChange={setSelectedLocation} onSearch={handleSearch} />
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

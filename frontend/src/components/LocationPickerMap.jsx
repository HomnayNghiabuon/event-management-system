import { useState, useCallback, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Search, Navigation, X } from 'lucide-react'

// Fix Leaflet marker icon với Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const DEFAULT_CENTER = [10.7769, 106.7009] // TP. Hồ Chí Minh

function formatAddress(addr, fallback = '') {
  if (!addr) return fallback
  const parts = [
    addr.house_number ? `${addr.house_number}` : null,
    addr.road || addr.pedestrian || addr.footway,
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
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 0.8 })
  }, [center, map])
  return null
}

export function LocationPickerMap({ value, onChange }) {
  const [showMap, setShowMap] = useState(false)
  const [position, setPosition] = useState(
    value?.latitude && value?.longitude ? [value.latitude, value.longitude] : null
  )
  const [flyTarget, setFlyTarget] = useState(null)
  const [searchQuery, setSearchQuery] = useState(value?.location || '')
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const debounceRef = useRef(null)

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`
      )
      const data = await res.json()
      return formatAddress(data.address, data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setPosition([lat, lng])
    const address = await reverseGeocode(lat, lng)
    setSearchQuery(address)
    onChange({ location: address, latitude: lat, longitude: lng })
  }, [onChange])

  const handleSearchInput = (e) => {
    const q = e.target.value
    setSearchQuery(q)
    // Nếu user gõ thủ công, xoá toạ độ cũ
    onChange({ location: q, latitude: null, longitude: null })
    clearTimeout(debounceRef.current)
    if (q.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        setSearching(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1&accept-language=vi`
          )
          const data = await res.json()
          setSuggestions(data)
        } catch {
          setSuggestions([])
        } finally {
          setSearching(false)
        }
      }, 600)
    } else {
      setSuggestions([])
    }
  }

  const selectSuggestion = (s) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    const label = formatAddress(s.address, s.display_name)
    setPosition([lat, lng])
    setFlyTarget([lat, lng])
    setSearchQuery(label)
    setSuggestions([])
    onChange({ location: label, latitude: lat, longitude: lng })
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setPosition([latitude, longitude])
        setFlyTarget([latitude, longitude])
        const address = await reverseGeocode(latitude, longitude)
        setSearchQuery(address)
        onChange({ location: address, latitude, longitude })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const clearLocation = () => {
    setSearchQuery('')
    setPosition(null)
    setFlyTarget(null)
    setSuggestions([])
    onChange({ location: '', latitude: null, longitude: null })
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm *</label>

      {/* Input tìm kiếm + nút mở map */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
              required
              placeholder="Tìm kiếm hoặc nhập địa chỉ..."
              className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-2 px-4 py-3 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all text-sm font-medium whitespace-nowrap"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
          </button>
        </div>

        {/* Gợi ý tìm kiếm */}
        {suggestions.length > 0 && (
          <div className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {searching && (
              <div className="px-4 py-2 text-sm text-gray-500">Đang tìm kiếm...</div>
            )}
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
                  <MapPin className="w-3.5 h-3.5 mt-0.5 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{main}</p>
                    {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bản đồ */}
      {showMap && (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
            <span className="text-xs text-gray-600 font-medium">
              Click vào bản đồ để chọn vị trí
            </span>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              {locating ? 'Đang xác định...' : 'Vị trí của tôi'}
            </button>
          </div>

          <MapContainer
            center={position || DEFAULT_CENTER}
            zoom={13}
            style={{ height: '350px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {flyTarget && <MapController center={flyTarget} />}
            {position && <Marker position={position} />}
          </MapContainer>

          {position && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              Tọa độ: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

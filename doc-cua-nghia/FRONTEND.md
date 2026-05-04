# Tài Liệu Frontend — Event Management System

> React 18 · Vite · React Router 7 · Axios · Tailwind CSS 4 · motion/react  
> Port: **5173** · Entry: `main.jsx` → `App.jsx` → `AuthProvider` + `RouterProvider`

---

## 1. Routing (routes.jsx)

```jsx
// Dùng createBrowserRouter từ 'react-router'
export const router = createBrowserRouter([

  // ── Public (không cần login) ──────────────────────────
  { path: '/',            element: <HomePage /> },
  { path: '/event/:id',   element: <EventDetailPage /> },
  { path: '/login',       element: <LoginPage /> },
  { path: '/register',    element: <RegisterPage /> },

  // ── Attendee (chỉ ATTENDEE) ──────────────────────────
  { path: '/my-tickets',  element: <ProtectedRoute roles={['ATTENDEE']}><MyTicketsPage /></ProtectedRoute> },
  { path: '/my-orders',   element: <ProtectedRoute roles={['ATTENDEE']}><MyOrdersPage /></ProtectedRoute> },

  // ── Tất cả 3 vai trò ──────────────────────────────────
  { path: '/notifications', element: <ProtectedRoute roles={['ATTENDEE','ORGANIZER','ADMIN']}><NotificationsPage /></ProtectedRoute> },
  { path: '/profile',       element: <ProtectedRoute roles={['ATTENDEE','ORGANIZER','ADMIN']}><ProfilePage /></ProtectedRoute> },

  // ── Organizer ─────────────────────────────────────────
  { path: '/organizer',                       element: <ProtectedRoute roles={['ORGANIZER']}><MyEventsPage /></ProtectedRoute> },
  { path: '/organizer/events/create',         element: <ProtectedRoute roles={['ORGANIZER']}><CreateEventPage /></ProtectedRoute> },
  { path: '/organizer/events/:id/edit',       element: <ProtectedRoute roles={['ORGANIZER']}><EditEventPage /></ProtectedRoute> },
  { path: '/organizer/events/:id/attendees',  element: <ProtectedRoute roles={['ORGANIZER']}><EventAttendeesPage /></ProtectedRoute> },
  { path: '/organizer/events/:id/stats',      element: <ProtectedRoute roles={['ORGANIZER']}><EventStatsPage /></ProtectedRoute> },
  { path: '/organizer/checkin',               element: <ProtectedRoute roles={['ORGANIZER']}><CheckInPage /></ProtectedRoute> },

  // ── Admin ─────────────────────────────────────────────
  { path: '/admin',               element: <ProtectedRoute roles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute> },
  { path: '/admin/events',        element: <ProtectedRoute roles={['ADMIN']}><AdminEventsPage /></ProtectedRoute> },
  { path: '/admin/organizers',    element: <ProtectedRoute roles={['ADMIN']}><AdminOrganizersPage /></ProtectedRoute> },
  { path: '/admin/commissions',   element: <ProtectedRoute roles={['ADMIN']}><AdminCommissionsPage /></ProtectedRoute> },
  { path: '/admin/categories',    element: <ProtectedRoute roles={['ADMIN']}><AdminCategoriesPage /></ProtectedRoute> },

  { path: '*', element: <Navigate to="/" replace /> },  // Catch-all
])
```

---

## 2. AuthContext (contexts/AuthContext.jsx)

```jsx
// State khởi tạo: đọc từ localStorage (đã login từ session trước)
const [user, setUser] = useState(() => {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null  // null nếu chưa login
  } catch { return null }
})
const [loading, setLoading] = useState(false)

// login()
const login = useCallback(async (email, password) => {
  setLoading(true)
  try {
    const data = await apiLogin(email, password)   // POST /auth/login
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)    // user = { id, fullName, email, role }
    return data.user      // ← caller dùng để redirect theo role
  } finally { setLoading(false) }
}, [])

// register()
const register = useCallback(async (formData) => {
  setLoading(true)
  try {
    const data = await apiRegister(formData)  // POST /auth/register
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    // Register response khác login response (userId thay vì id)
    const userObj = { userId: data.userId, fullName: data.fullName, email: data.email, role: data.role }
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)
    return data
  } finally { setLoading(false) }
}, [])

// logout()
const logout = useCallback(() => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  setUser(null)    // React re-render, ProtectedRoute redirect về /login
}, [])

// Expose qua context
<AuthContext.Provider value={{ user, loading, login, register, logout }}>
  {children}
</AuthContext.Provider>

// Hook để dùng trong component
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
```

Dùng:
```jsx
const { user, login, logout, loading } = useAuth()
// user = null nếu chưa login
// user.role = "ADMIN" | "ORGANIZER" | "ATTENDEE"
```

---

## 3. Axios Client (api/client.js)

```js
const BASE_URL = 'http://localhost:8081/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: gắn token vào mọi request ──
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: auto refresh token khi 401 ──
let isRefreshing = false
let refreshQueue = []   // Queue các request đang chờ refresh

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true  // Đánh dấu đã retry, tránh vòng lặp vô hạn

      if (isRefreshing) {
        // Đang refresh → xếp vào queue chờ
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return client(original)  // Retry với token mới
          })
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // Không có refresh token → logout
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Gọi refresh endpoint (dùng axios gốc, không phải client để tránh loop)
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        client.defaults.headers.Authorization = `Bearer ${data.accessToken}`

        // Retry tất cả request trong queue
        refreshQueue.forEach((p) => p.resolve(data.accessToken))
        refreshQueue = []

        original.headers.Authorization = `Bearer ${data.accessToken}`
        return client(original)  // Retry request gốc
      } catch {
        // Refresh thất bại → logout hoàn toàn
        refreshQueue.forEach((p) => p.reject(error))
        refreshQueue = []
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default client
```

---

## 4. API Modules

### auth.js
```js
export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then(r => r.data)

export const register = (data) =>
  client.post('/auth/register', data).then(r => r.data)

export const refreshToken = (refreshToken) =>
  client.post('/auth/refresh-token', { refreshToken }).then(r => r.data)
```

### events.js
```js
export const getEvents = (params) =>
  client.get('/events', { params }).then(r => r.data)
  // params: { search, categoryId, location, date, page, size, sort }

export const getEventById = (id) =>
  client.get(`/events/${id}`).then(r => r.data)

export const createEvent = (data) =>
  client.post('/events', data).then(r => r.data)

export const updateEvent = (id, data) =>
  client.put(`/events/${id}`, data).then(r => r.data)

export const publishEvent = (id, publish) =>
  client.patch(`/events/${id}/publish`, { publish }).then(r => r.data)

export const deleteEvent = (id) =>
  client.delete(`/events/${id}`)

export const getMyEvents = (params) =>
  client.get('/events/my', { params }).then(r => r.data)

export const getEventStats = (id) =>
  client.get(`/events/${id}/stats`).then(r => r.data)

export const getEventAttendees = (id) =>
  client.get(`/events/${id}/attendees`).then(r => r.data)

export const sendEventNotification = (id, data) =>
  client.post(`/events/${id}/notify`, data).then(r => r.data)
```

### tickets.js
```js
export const getMyTickets = () =>
  client.get('/tickets/my').then(r => r.data)
  // Returns: [{ ticketId, qrCode, attendeeName, checkinStatus, checkinTime,
  //             isValid, eventTitle, ticketTypeName, qrImageUrl }]

export const fetchQrImage = async (qrCode) => {
  const res = await client.get(`/tickets/${qrCode}/qr-image`, { responseType: 'blob' })
  return URL.createObjectURL(res.data)  // Tạo blob URL để hiển thị <img src>
}

export const checkin = (qrCode) =>
  client.post(`/tickets/${qrCode}/checkin`).then(r => r.data)
  // Returns: { success, message, checkinTime, attendeeName }
```

### reservations.js
```js
export const reserve = (ticketTypeId, quantity) =>
  client.post('/reservations/reserve', { ticketTypeId, quantity }).then(r => r.data)

export const purchase = (reservationId, paymentMethod, attendeeNames) =>
  client.post('/reservations/purchase', { reservationId, paymentMethod, attendeeNames }).then(r => r.data)

export const getMyReservations = (params) =>
  client.get('/reservations/my', { params }).then(r => r.data)

export const cancelReservation = (id) =>
  client.delete(`/reservations/${id}`)
```

### admin.js
```js
export const getAdminEvents = (params) =>
  client.get('/admin/events', { params }).then(r => r.data)

export const reviewEvent = (id, action, reason) =>
  client.patch(`/admin/events/${id}/approval`, { action, reason }).then(r => r.data)

export const getOrganizers = (params) =>
  client.get('/admin/organizers', { params }).then(r => r.data)

export const createOrganizer = (data) =>
  client.post('/admin/organizers', data).then(r => r.data)

export const updateOrganizer = (id, data) =>
  client.put(`/admin/organizers/${id}`, data).then(r => r.data)

export const deleteOrganizer = (id) =>
  client.delete(`/admin/organizers/${id}`)

export const getAdminStats = () =>
  client.get('/admin/stats').then(r => r.data)

export const setUserStatus = (userId, active) =>
  client.patch(`/admin/users/${userId}/status`, null, { params: { active } })
  // ⚠️ active truyền qua query param, không phải body

export const getCommissions = () =>
  client.get('/admin/commissions').then(r => r.data)

export const getActiveCommission = () =>
  client.get('/admin/commissions/active').then(r => r.data)

export const createCommission = (data) =>
  client.post('/admin/commissions', data).then(r => r.data)

export const updateCommission = (id, data) =>
  client.patch(`/admin/commissions/${id}`, data).then(r => r.data)
```

---

## 5. Components

### ProtectedRoute.jsx

```jsx
// Guard route theo role
export function ProtectedRoute({ roles, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
```

### BookingFlow.jsx — Modal 3 bước

```jsx
// State chính
const [step, setStep] = useState('select')  // 'select'|'attendee'|'payment'|'success'|'failed'|'expired'
const [quantities, setQuantities] = useState({})      // { [ticketTypeId]: số lượng }
const [reservations, setReservations] = useState([])  // Reservation đã tạo
const [attendeeNames, setAttendeeNames] = useState({}) // { [reservationId]: ['Tên 1','Tên 2'] }
const [paymentMethod, setPaymentMethod] = useState('MOMO')
const [expiresAt, setExpiresAt] = useState(null)      // Thời gian hết hạn sớm nhất
const [secondsLeft, setSecondsLeft] = useState(0)     // Countdown

// Countdown timer
useEffect(() => {
  if (!expiresAt || step !== 'attendee') return
  const tick = () => {
    const left = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000))
    setSecondsLeft(left)
    if (left === 0) setStep('expired')  // Hết giờ → chuyển step
  }
  tick()
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, [expiresAt, step])

// Màu timer: xanh (>60s) → vàng (>30s) → đỏ (<30s)
const timerColor = secondsLeft > 60 ? 'text-green-600' : secondsLeft > 30 ? 'text-yellow-500' : 'text-red-600'

// Giới hạn số lượng: tối đa 10 vé hoặc số còn lại của loại vé (lấy min)
disabled={(quantities[ticket.ticketTypeId] || 0) >= Math.min(10, ticket.quantity)}

// handleReserve() — Bước 1 → 2
const handleReserve = async () => {
  if (!user) { onClose(); navigate('/login'); return }
  const made = []
  try {
    for (const item of selectedItems) {
      const res = await reserve(item.ticket.ticketTypeId, item.quantity)
      made.push(res)
    }
    setReservations(results)
    // Điền sẵn tên user cho mỗi slot
    const initNames = {}
    results.forEach(r => {
      initNames[r.reservationId] = Array(r.quantity).fill(user.fullName || '')
    })
    setAttendeeNames(initNames)
    // Lấy expiresAt sớm nhất (nếu mua nhiều loại)
    const earliest = results.map(r => r.expirationTime).filter(Boolean)
      .reduce((min, t) => (!min || new Date(t) < new Date(min) ? t : min), null)
    if (earliest) setExpiresAt(earliest)
    setStep('attendee')
  } catch (err) {
    // Rollback: cancel tất cả reservation đã tạo
    for (const r of made) cancelReservation(r.reservationId).catch(() => {})
    setError(err.response?.data?.error || 'Không thể giữ vé')
  }
}

// handleConfirmPayment() — Bước 3
const handleConfirmPayment = async () => {
  try {
    for (const res of reservations) {
      const names = attendeeNames[res.reservationId] || []
      await purchase(res.reservationId, paymentMethod, names)
    }
    setStep('success')
  } catch (err) {
    setStep('failed')
  }
}

// Thanh toán render: 3 options (MOMO/VNPAY/CASH) dạng radio button
const PAYMENT_METHODS = [
  { value: 'MOMO',  label: 'Ví MoMo',  color: 'bg-pink-600',  icon: 'M' },
  { value: 'VNPAY', label: 'VNPay',    color: 'bg-red-600',   icon: 'V' },
  { value: 'CASH',  label: 'Tiền mặt', color: 'bg-green-600', icon: '₫' },
]

// Styling loại vé theo tên
const TIER_STYLE = {
  VIP:      { badge: 'bg-amber-100 text-amber-700', ... },
  STANDARD: { badge: 'bg-blue-100 text-blue-700', ... },
  ECONOMY:  { badge: 'bg-green-100 text-green-700', ... },
}
const tierStyle = (name) => TIER_STYLE[name?.toUpperCase()] ?? TIER_STYLE.STANDARD

// Animation với motion/react (Framer Motion)
<AnimatePresence mode="wait">
  {step === 'select' && (
    <motion.div key="select"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}>
      ...
    </motion.div>
  )}
  // Tương tự cho 'attendee', 'payment', 'success', 'failed', 'expired'
</AnimatePresence>
```

### CheckInPage.jsx — Camera QR Scanning

```jsx
// Refs quan trọng
const videoRef = useRef(null)    // <video> element stream camera
const canvasRef = useRef(null)   // <canvas> ẩn để decode frame
const streamRef = useRef(null)   // MediaStream để stop tracks
const rafRef = useRef(null)      // requestAnimationFrame ID
const cooldownRef = useRef(false)// Tránh scan liên tục cùng 1 QR

// startCamera()
const startCamera = useCallback(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'environment' },  // Camera sau (nếu có)
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  })
  streamRef.current = stream
  videoRef.current.srcObject = stream
  videoRef.current.onloadedmetadata = () => {
    videoRef.current.play()
    setScanning(true)
    rafRef.current = requestAnimationFrame(scanFrame)  // Bắt đầu loop
  }
})

// scanFrame() — chạy mỗi frame (~60fps)
const scanFrame = useCallback(() => {
  // Vẽ frame video vào canvas
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.drawImage(video, 0, 0)

  // Decode QR
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert'  // Không cần check negative
  })

  if (code && !cooldownRef.current && !loading) {
    cooldownRef.current = true
    doCheckin(code.data)             // code.data = UUID string của ticket
    setTimeout(() => { cooldownRef.current = false }, 2000)  // Cooldown 2 giây
  }

  rafRef.current = requestAnimationFrame(scanFrame)  // Tiếp tục loop
}, [doCheckin, loading])

// stopCamera()
const stopCamera = useCallback(() => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current)  // Dừng loop
  if (streamRef.current) {
    streamRef.current.getTracks().forEach(t => t.stop())    // Tắt camera
    streamRef.current = null
  }
  setScanning(false)
})

// Restart scanFrame sau mỗi lần API xong (loading thay đổi)
useEffect(() => {
  if (mode === 'camera' && scanning && !loading) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(scanFrame)
  }
}, [loading])

// doCheckin() — gọi cho cả manual và camera
const doCheckin = useCallback(async (code) => {
  if (!code.trim() || loading) return
  setLoading(true)
  try {
    const data = await checkin(code.trim())
    setResult({ success: data.success, message: data.message, attendeeName: data.attendeeName, ... })
    // Thêm vào history (giữ tối đa 10 bản ghi gần nhất)
    setHistory(h => [{ qrCode: code.trim(), ...data, time: new Date() }, ...h.slice(0, 9)])
  } catch (err) {
    const msg = err.response?.data?.error || err.response?.data?.message || 'Lỗi kiểm tra vé'
    setResult({ success: false, message: msg })
  } finally { setLoading(false) }
}, [loading])

// Visual overlay camera: 4 góc bracket + thanh scan
<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <div className="relative w-56 h-56">
    <span className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
    <span className="absolute top-0 right-0 ..." />
    <span className="absolute bottom-0 left-0 ..." />
    <span className="absolute bottom-0 right-0 ..." />
    <div className="absolute inset-x-2 top-1/2 h-0.5 bg-green-400 opacity-80 animate-pulse" />
  </div>
</div>
```

### MyTicketsPage.jsx — QR Modal + Download

```jsx
// State
const [tickets, setTickets] = useState([])
const [selectedQr, setSelectedQr] = useState(null)   // Ticket đang xem QR
const [qrBlobUrl, setQrBlobUrl] = useState(null)      // Blob URL của ảnh QR
const blobUrlRef = useRef(null)                        // Để revoke khi unmount

// Khi selectedQr thay đổi → fetch QR image
useEffect(() => {
  if (!selectedQr) return
  setQrLoading(true)
  fetchQrImage(selectedQr.qrCode)       // GET /tickets/{qrCode}/qr-image (blob)
    .then(url => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)  // Giải phóng URL cũ
      blobUrlRef.current = url
      setQrBlobUrl(url)
    })
  return () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)   // Cleanup khi modal đóng
  }
}, [selectedQr])

// Phân loại vé
const validTickets = tickets.filter(t => t.isValid)     // Vé hợp lệ
const invalidTickets = tickets.filter(t => !t.isValid)  // Vé đã hủy (opacity-60)

// TicketCard status badge
{ticket.checkinStatus ? 'bg-green-100 text-green-700'   // Checked
  : ticket.isValid    ? 'bg-blue-100 text-blue-700'     // Hợp lệ
                      : 'bg-red-100 text-red-700'}      // Đã hủy
// Border: border-l-4 border-purple-500 (valid) | border-gray-300 (invalid)

// downloadTicket() — Canvas rendering chi tiết
const downloadTicket = async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 700
  canvas.height = 280
  const ctx = canvas.getContext('2d')

  // 1. Gradient background #4F46E5 → #7C3AED
  const grad = ctx.createLinearGradient(0, 0, 700, 280)
  grad.addColorStop(0, '#4F46E5')
  grad.addColorStop(1, '#7C3AED')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.roundRect(0, 0, 700, 280, 16); ctx.fill()

  // 2. White panel trái (nội dung): roundRect(16,16,440,248,12)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.roundRect(16, 16, 440, 248, 12); ctx.fill()

  // 3. Semi-transparent panel phải (QR): rgba(255,255,255,0.15), roundRect(472,16,212,248,12)

  // 4. Brand text "BuyTicket" màu tím tại (32, 48)
  // 5. Event title tại (32, 80), cắt nếu quá dài
  // 6. Ticket type badge (EDE9FE / 6D28D9) tại (32, 92)
  // 7. "Người tham dự" label + attendeeName
  // 8. Mã vé "#ticketId"
  // 9. Status badge (D1FAE5/059669 nếu checked-in | DBEAFE/2563EB nếu hợp lệ)
  // 10. Dashed vertical line tại x=460
  ctx.setLineDash([6, 4])
  ctx.strokeStyle = '#E5E7EB'
  ctx.beginPath(); ctx.moveTo(460, 32); ctx.lineTo(460, 248); ctx.stroke()
  ctx.setLineDash([])

  // 11. QR image: await img.onload → ctx.drawImage(img, 488, 36, 180, 180)
  if (qrBlobUrl) {
    await new Promise(resolve => {
      const img = new Image()
      img.onload = () => { ctx.drawImage(img, 488, 36, 180, 180); resolve() }
      img.onerror = resolve
      img.src = qrBlobUrl
    })
  }

  // 12. QR code text (monospace, truncated tại 20 chars + "…")
  // 13. Download
  const link = document.createElement('a')
  link.download = `ticket-${ticket.ticketId}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
```

---

## 6. Pages — Chi tiết

### HomePage (public)

```jsx
// State
const [events, setEvents] = useState([])        // Danh sách sự kiện
const [categories, setCategories] = useState([]) // Danh sách danh mục
const [totalPages, setTotalPages] = useState(0)
const [currentPage, setCurrentPage] = useState(0)
const [search, setSearch] = useState('')
const [selectedCategory, setSelectedCategory] = useState(null)  // null = tất cả
const [locationFilter, setLocationFilter] = useState('')
const [loading, setLoading] = useState(true)

// Load events khi filter thay đổi
useEffect(() => {
  getEvents({
    search: search || undefined,
    categoryId: selectedCategory || undefined,
    location: locationFilter || undefined,
    page: currentPage,
    size: 9
  }).then(data => {
    setEvents(data.content)
    setTotalPages(data.totalPages)
  })
}, [search, selectedCategory, locationFilter, currentPage])

// CategoryTabs: click vào tab → setSelectedCategory(id) + reset page về 0
// HeroSearch: search bar + location input → debounce hoặc submit form
// EventGrid: grid 1→2→3 cột theo breakpoint, mỗi ô là EventCard
// Pagination: Previous (disabled nếu page=0) + số trang + Next (disabled nếu last)
```

### EventDetailPage (public)

```jsx
// Load event từ params :id
const { id } = useParams()
const event = await getEventById(id)
// event.ticketTypes[] → hiển thị danh sách loại vé + giá + số còn lại

// Map với Leaflet (nếu có lat/lng)
{event.latitude && event.longitude && (
  <MapContainer center={[event.latitude, event.longitude]} zoom={15}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={[event.latitude, event.longitude]}>
      <Popup>{event.location}</Popup>
    </Marker>
  </MapContainer>
)}

// Nút "Đặt vé ngay" → mở BookingFlow modal
const [showBooking, setShowBooking] = useState(false)
{showBooking && (
  <BookingFlow
    eventTitle={event.title}
    ticketTypes={event.ticketTypes}
    onClose={() => setShowBooking(false)}
  />
)}
```

### CreateEventPage / EditEventPage (Organizer)

```jsx
// Form state
const [formData, setFormData] = useState({
  title, description, categoryId,
  eventDate, startTime, endTime,
  location, latitude, longitude, addressDetail,
  thumbnail,
  ticketTypes: [{ name:'', price:0, quantity:0 }]
})

// Thumbnail upload
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  const url = await uploadImage(file)  // POST /upload/image → Cloudinary URL
  setFormData(prev => ({ ...prev, thumbnail: url }))
}

// LocationPickerMap: click vào map → cập nhật lat/lng
<LocationPickerMap
  initialLat={formData.latitude}
  initialLng={formData.longitude}
  onChange={({ lat, lng }) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
/>

// TicketTypes dynamic list
const addTicketType = () =>
  setFormData(prev => ({ ...prev, ticketTypes: [...prev.ticketTypes, { name:'', price:0, quantity:0 }] }))

const removeTicketType = (index) =>
  setFormData(prev => ({ ...prev, ticketTypes: prev.ticketTypes.filter((_, i) => i !== index) }))

// Submit
const handleSubmit = async () => {
  if (isEdit) await updateEvent(eventId, formData)  // PUT
  else        await createEvent(formData)            // POST
  navigate('/organizer')
}
```

### MyEventsPage (Organizer)

```jsx
// Tabs: "Tất cả" | "DRAFT" | "PUBLISHED"
// Filter: events.filter(e => !statusFilter || e.status === statusFilter)

// Actions mỗi event:
// - Sửa: disabled nếu PUBLISHED → phải unpublish trước
// - Xóa: confirm dialog → deleteEvent(id)
// - Publish toggle: publishEvent(id, !isPub) → setEvents(...)
// - Xem attendees: navigate(`/organizer/events/${id}/attendees`)
// - Xem stats: navigate(`/organizer/events/${id}/stats`)
```

### AdminEventsPage (Admin)

```jsx
// Filter tabs: Tất cả | PENDING | APPROVED | REJECTED
// getAdminEvents({ approvalStatus: tab, page, size })

// Approve action:
const handleApprove = async (eventId) => {
  await reviewEvent(eventId, 'APPROVE', null)
  // Reload list
}

// Reject action (dialog):
const [rejectDialog, setRejectDialog] = useState({ open: false, eventId: null, reason: '' })
const handleReject = async () => {
  await reviewEvent(rejectDialog.eventId, 'REJECT', rejectDialog.reason)
  setRejectDialog({ open: false, eventId: null, reason: '' })
}
```

### AdminDashboardPage (Admin)

```jsx
// Load stats một lần khi mount
useEffect(() => {
  getAdminStats().then(data => setStats(data))
}, [])

// Hiển thị cards:
// totalEvents, pendingEvents, approvedEvents, rejectedEvents
// totalOrganizers, totalAttendees, totalOrders, totalRevenue

// Quick links:
// → /admin/events?approvalStatus=PENDING  (Duyệt sự kiện)
// → /admin/organizers                     (Quản lý organizer)
// → /admin/commissions                    (Commission)
```

### EventStatsPage (Organizer)

```jsx
// getEventStats(eventId)
// Response: { ticketsSold, ticketsAvailable, revenue, commissionPercent, commissionAmount, netRevenue, totalOrders, checkedInCount }

// Format tiền: Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
// VD: 50000000 → "50.000.000 ₫"
```

---

## 7. State Management

Không dùng Redux hay Zustand. State quản lý theo 3 tầng:

| Tầng | Công cụ | Dùng cho |
|------|---------|---------|
| Global persistent | `AuthContext` + `localStorage` | user object, JWT tokens |
| Page-level | `useState` + `useEffect` | data fetch, loading, UI state |
| URL | React Router params/query | eventId (`/event/:id`), filters |

---

## 8. Styling Conventions

```
Tailwind CSS 4 — utility-first, mobile-first

Màu chính:
  Purple: from-blue-500 to-purple-600 (gradient)
  Background: bg-[#F5F7FA] (gray nhạt cho page)
  White: bg-white (cards)

Responsive breakpoints:
  Mặc định: mobile
  sm: ≥640px (tablet nhỏ)
  md: ≥768px
  lg: ≥1024px (desktop)

Pattern phổ biến:
  Card: "bg-white rounded-xl shadow-md p-5"
  Button primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
  Button secondary: "border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
  Input: "border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
  Badge success: "bg-green-100 text-green-700"
  Badge error: "bg-red-100 text-red-700"
  Badge info: "bg-blue-100 text-blue-700"
```

---

## 9. Thư viện & phiên bản

| Thư viện | Mục đích |
|----------|---------|
| `axios` | HTTP client |
| `react-router` (v7) | Client-side routing, `createBrowserRouter` |
| `leaflet` + `react-leaflet` | Bản đồ, marker, popup |
| `jsqr` | Decode QR code từ camera ImageData |
| `motion/react` | Animation (AnimatePresence, motion.div) |
| `lucide-react` | Icons: QrCode, CheckCircle, XCircle, Camera, Loader2... |
| `tailwindcss` v4 | Styling |

---

## 10. Luồng xác thực đầy đủ

```
1. User nhập email + password → LoginPage.handleSubmit()
2. await login(email, password)  [AuthContext]
3. POST /auth/login → { accessToken, refreshToken, user }
4. localStorage: accessToken, refreshToken, user (JSON)
5. setUser(data.user) → AuthContext re-render
6. Redirect theo role:
   - ADMIN → /admin
   - ORGANIZER → /organizer
   - ATTENDEE → /

7. Mọi request: Authorization: Bearer {accessToken}  [client.js interceptor]

8. Nếu 401 nhận về:
   isRefreshing = true
   POST /auth/refresh-token { refreshToken }
   Nhận { accessToken mới }
   localStorage.setItem('accessToken', ...)
   Retry request gốc với token mới
   Các request đang chờ trong refreshQueue được retry

9. Nếu refresh thất bại → localStorage.clear() → window.location.href='/login'

10. logout(): removeItem (3 keys) → setUser(null) → ProtectedRoute redirect /login
```

---

## 11. Chạy Frontend

```bash
cd frontend
npm install
npm run dev         # Development: http://localhost:5173
npm run build       # Production build → frontend/dist/
npm run preview     # Preview production build
```

import axios from 'axios'

const BASE_URL = 'http://localhost:8081/api/v1'

// Axios instance dùng chung cho toàn bộ app — mọi API call đều đi qua đây
const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: tự động gắn JWT access token vào header Authorization
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// isRefreshing: cờ tránh gọi refresh token nhiều lần song song
// refreshQueue: hàng đợi các request bị 401 trong khi đang refresh
let isRefreshing = false
let refreshQueue = []

// Response interceptor: khi nhận 401, tự động refresh token và retry request gốc.
// Các request khác bị 401 cùng lúc sẽ được xếp vào queue và retry sau khi refresh xong.
// Nếu refresh thất bại (token hết hạn) → clear localStorage và redirect về /login.
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        // Đợi refresh xong rồi retry với token mới
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return client(original)
          })
          .catch((err) => Promise.reject(err))
      }

      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        client.defaults.headers.Authorization = `Bearer ${data.accessToken}`
        refreshQueue.forEach((p) => p.resolve(data.accessToken))
        refreshQueue = []
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return client(original)
      } catch {
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

import axios from 'axios'

const BASE_URL = 'http://localhost:8081/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let refreshQueue = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
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

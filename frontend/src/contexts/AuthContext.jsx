import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister } from '../api/auth'

const AuthContext = createContext(null)

// AuthProvider: bọc toàn bộ app, cung cấp user state + hàm login/register/logout
export function AuthProvider({ children }) {
  // Khởi tạo user từ localStorage để giữ đăng nhập qua refresh trang
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Gọi API đăng nhập, lưu token + user vào localStorage và cập nhật state
  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await apiLogin(email, password)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  // Gọi API đăng ký, tự động đăng nhập luôn sau khi thành công
  const register = useCallback(async (formData) => {
    setLoading(true)
    try {
      const data = await apiRegister(formData)
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      const userObj = { userId: data.userId, fullName: data.fullName, email: data.email, role: data.role }
      localStorage.setItem('user', JSON.stringify(userObj))
      setUser(userObj)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  // Xóa toàn bộ token và user khỏi localStorage, reset state về null
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — ném lỗi rõ ràng nếu dùng ngoài AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

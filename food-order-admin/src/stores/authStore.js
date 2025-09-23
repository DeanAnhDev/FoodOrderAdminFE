import { defineStore } from 'pinia'
import { loginUser, registerUser, logoutUser } from '@/services/authSerice'
import { extractUserFromToken, extractRolesFromToken, isTokenExpired } from '@/utils/jwt'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loading: false,
    error: null,
    message: '',
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    roles: [],
  }),

  getters: {
    isAdmin: (state) => state.roles.includes('Admin'),
    isManager: (state) => state.roles.includes('Manager'),
    hasRole: (state) => (role) => state.roles.includes(role),
  },

  actions: {
    async login(loginData) {
      this.loading = true
      this.error = null
      try {
        const response = await loginUser(loginData)

        // API response format: { status, message, accessToken, refreshToken, expiresIn }
        this.message = response.data.message
        this.accessToken = response.data.accessToken
        this.refreshToken = response.data.refreshToken

        // Extract user info and roles from JWT token
        this.user = extractUserFromToken(this.accessToken)
        this.roles = extractRolesFromToken(this.accessToken)
        this.isAuthenticated = true

        // Store in localStorage
        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('roles', JSON.stringify(this.roles))
      } catch (err) {
        this.message = ''
        const msg = err.response?.data?.message || 'Đăng nhập thất bại!'
        this.error = msg
        this.isAuthenticated = false
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await registerUser(userData)
        this.message = response.data.message
      } catch (err) {
        this.error = err.response?.data?.message || 'Đăng ký thất bại!'
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        const accessToken = this.accessToken || localStorage.getItem('accessToken')
        const refreshToken = this.refreshToken || localStorage.getItem('refreshToken')

        if (accessToken && refreshToken) {
          await logoutUser({ accessToken, refreshToken }) // Gọi API logout
        }
      } catch (err) {
        console.warn('API logout thất bại, vẫn tiếp tục xóa local:', err)
      }

      // Dù API fail thì vẫn xóa token và reset store
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.roles = []
      this.isAuthenticated = false
      this.message = ''
      this.error = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('roles')
    },

    // Khôi phục trạng thái từ localStorage
    initializeAuth() {
      const token = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const user = localStorage.getItem('user')
      const roles = localStorage.getItem('roles')

      if (token && refreshToken) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token expired, clear auth data
          this.logout()
          return
        }

        this.accessToken = token
        this.refreshToken = refreshToken
        this.isAuthenticated = true

        // Try to get user from localStorage first, if not available, extract from token
        if (user) {
          this.user = JSON.parse(user)
        } else {
          this.user = extractUserFromToken(token)
          if (this.user) {
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        }

        // Try to get roles from localStorage first, if not available, extract from token
        if (roles) {
          this.roles = JSON.parse(roles)
        } else {
          this.roles = extractRolesFromToken(token)
          if (this.roles.length > 0) {
            localStorage.setItem('roles', JSON.stringify(this.roles))
          }
        }
      }
    },
  },
})

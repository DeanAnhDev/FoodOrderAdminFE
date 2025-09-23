import { useAuthStore } from '@/stores/authStore'

export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()

  // Khôi phục trạng thái auth từ localStorage
  authStore.initializeAuth()

  if (!authStore.isAuthenticated) {
    // Redirect to login with return url
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}

export const requireRole = (roles = []) => {
  return (to, from, next) => {
    const authStore = useAuthStore()

    authStore.initializeAuth()

    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Kiểm tra quyền
    const hasRequiredRole = roles.some((role) => authStore.hasRole(role))

    if (roles.length === 0 || hasRequiredRole) {
      next()
    } else {
      // Không có quyền truy cập
      next({
        path: '/unauthorized',
        query: { message: 'Bạn không có quyền truy cập trang này' },
      })
    }
  }
}

export const requireAdmin = requireRole(['Admin'])
export const requireManager = requireRole(['Admin', 'Manager'])

export const guestOnly = (to, from, next) => {
  const authStore = useAuthStore()

  authStore.initializeAuth()

  if (authStore.isAuthenticated) {
    // Already logged in, redirect to dashboard
    next('/dashboard')
  } else {
    next()
  }
}

import { createRouter, createWebHistory } from 'vue-router'
import AccountManagementView from '@/views/AccountManagementView.vue'
import CategoryManagementView from '@/views/CategoryManagementView.vue'
import ComboManagementView from '@/views/ComboManagementView.vue'
import FoodManagementView from '@/views/FoodManagementView.vue'
import StaffManagementView from '@/views/StaffManagementView.vue'
import Layout from '@/layouts/admin/Layout.vue'
import DashboardView from '@/views/DashBoardView.vue'
import VoucherManagementView from '@/views/VoucherManagementView.vue'
import PromotionManagementView from '@/views/PromotionManagementView.vue'
import BillManagementView from '@/views/BillManagementView.vue'
import RevenueView from '@/views/RevenueView.vue'
import POSView from '@/views/POSView.vue'
import CheckoutSuccessView from '@/views/CheckoutSuccessView.vue'
import CheckoutFailedView from '@/views/CheckoutFailedView.vue'
import LoginView from '@/views/LoginView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import {
  requireAuth,
  requireAdmin,
  requireManager,
  requireStaff,
  guestOnly,
} from '@/middleware/auth'

const routes = [
  // Auth routes (không cần đăng nhập)
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: guestOnly,
    meta: { title: 'Đăng nhập - Food Order Admin' },
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: { title: 'Không có quyền truy cập' },
  },

  // VNPay Callback routes (không cần đăng nhập)
  {
    path: '/checkout-success',
    name: 'checkout-success',
    component: CheckoutSuccessView,
    meta: { title: 'Thanh toán thành công' },
  },
  {
    path: '/checkout-failed',
    name: 'checkout-failed',
    component: CheckoutFailedView,
    meta: { title: 'Thanh toán thất bại' },
  },

  // Admin routes (cần đăng nhập)
  {
    path: '/',
    component: Layout,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { title: 'Dashboard', requiresAuth: true },
      },
      {
        path: 'pos',
        name: 'pos',
        component: POSView,
        beforeEnter: requireStaff,
        meta: {
          title: 'Bán hàng tại quầy',
          requiresAuth: true,
          roles: ['Admin', 'Manager', 'Staff'],
        },
      },
      {
        path: 'combo',
        name: 'combo',
        component: ComboManagementView,
        beforeEnter: requireStaff,
        meta: { title: 'Quản lý Combo', requiresAuth: true, roles: ['Admin', 'Manager', 'Staff'] },
      },
      {
        path: 'food',
        name: 'food',
        component: FoodManagementView,
        beforeEnter: requireStaff,
        meta: { title: 'Quản lý Món ăn', requiresAuth: true, roles: ['Admin', 'Manager', 'Staff'] },
      },
      {
        path: 'category',
        name: 'category',
        component: CategoryManagementView,
        beforeEnter: requireManager,
        meta: { title: 'Quản lý Danh mục', requiresAuth: true, roles: ['Admin', 'Manager'] },
      },
      {
        path: 'account',
        name: 'account',
        component: AccountManagementView,
        beforeEnter: requireAdmin,
        meta: { title: 'Quản lý Tài khoản', requiresAuth: true, roles: ['Admin'] },
      },
      {
        path: 'staff',
        name: 'staff',
        component: StaffManagementView,
        beforeEnter: requireAdmin,
        meta: { title: 'Quản lý Nhân viên', requiresAuth: true, roles: ['Admin'] },
      },
      {
        path: 'voucher',
        name: 'voucher',
        component: VoucherManagementView,
        beforeEnter: requireManager,
        meta: { title: 'Quản lý Voucher', requiresAuth: true, roles: ['Admin', 'Manager'] },
      },
      {
        path: 'promotion',
        name: 'promotion',
        component: PromotionManagementView,
        beforeEnter: requireManager,
        meta: { title: 'Quản lý Khuyến mãi', requiresAuth: true, roles: ['Admin', 'Manager'] },
      },
      {
        path: 'billmanagement',
        name: 'billmanagement',
        component: BillManagementView,
        beforeEnter: requireStaff,
        meta: {
          title: 'Quản lý Đơn hàng',
          requiresAuth: true,
          roles: ['Admin', 'Manager', 'Staff'],
        },
      },
      {
        path: 'revenue',
        name: 'revenue',
        component: RevenueView,
        beforeEnter: requireManager,
        meta: { title: 'Báo cáo doanh thu', requiresAuth: true, roles: ['Admin', 'Manager'] },
      },
    ],
  },

  // 404 route
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Global navigation guard để set page title
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

export default router

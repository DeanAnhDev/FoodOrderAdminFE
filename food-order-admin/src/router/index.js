import { createRouter, createWebHistory } from 'vue-router'
import AccountManagementView from '@/views/AccountManagementView.vue'
import CategoryManagementView from '@/views/CategoryManagementView.vue'
import ComboManagementView from '@/views/ComboManagementView.vue'
import FoodManagementView from '@/views/FoodManagementView.vue'
import Layout from '@/layouts/admin/Layout.vue'
import DashboardView from '@/views/DashBoardView.vue'
import VoucherManagementView from '@/views/VoucherManagementView.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      { path: 'combo', name: 'combo', component: ComboManagementView },
      { path: 'food', name: 'food', component: FoodManagementView },
      { path: 'category', name: 'category', component: CategoryManagementView },
      { path: 'account', name: 'account', component: AccountManagementView },
      { path: 'voucher', name: 'voucher', component: VoucherManagementView },
    ],
  },

  // Nếu muốn dùng auth layout, mở phần này ra
  // {
  //   path: '/auth',
  //   component: generallayout,
  //   children: [
  //     { path: '', name: 'Login', component: Login },
  //     { path: 'register', name: 'Register', component: Register },
  //     { path: 'forgotpassword', name: 'ForgotPassword', component: forgotpassword },
  //   ]
  // }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

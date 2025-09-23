import { defineStore } from 'pinia'
import { getCustomers } from '@/services/userService'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    loading: false,
    error: null,
    query: {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: null, // Tìm kiếm theo email hoặc số điện thoại
      email: null, // Tìm kiếm cụ thể theo email
      phoneNumber: null, // Tìm kiếm cụ thể theo số điện thoại
    },
  }),

  actions: {
    async fetchCustomers(customQuery = {}) {
      this.loading = true
      this.error = null

      try {
        const res = await getCustomers({ ...this.query, ...customQuery })
        this.customers = res.data.data || []
        this.totalCount = res.data.totalCount
        this.pageNumber = res.data.pageNumber
        this.pageSize = res.data.pageSize
        this.totalPages = res.data.totalPages
        this.hasNextPage = res.data.hasNextPage
        this.hasPreviousPage = res.data.hasPreviousPage
      } catch (err) {
        this.error = err.response?.data?.message || 'Không thể tải danh sách khách hàng'
      } finally {
        this.loading = false
      }
    },
    async fetchUser() {
      this.loading = true
      this.error = null
      try {
        const res = await getCurrentUser()
        this.user = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi không xác định!'
      } finally {
        this.loading = false
      }
    },

    async updateUserInfo(data) {
      try {
        const res = await updateUser(data)
        this.user = res.data || data
      } catch (err) {
        throw err
      }
    },

    async changeUserPassword(data) {
      this.loading = true
      this.error = null

      try {
        const res = await changePassword(data)
        return res // 👈 BẠT BUỘC PHẢI CÓ `return`
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi không xác định'
        throw err
      } finally {
        this.loading = false
      }
    },
    setQuery(updates) {
      this.query = { ...this.query, ...updates }
    },
  },
})

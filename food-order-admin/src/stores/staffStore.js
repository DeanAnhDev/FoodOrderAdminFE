import { defineStore } from 'pinia'
import {
  getCustomers,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from '@/services/userService'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Customers
    customers: [],
    totalCustomers: 0,
    customerFilters: {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      email: '',
      phoneNumber: '',
    },

    // Staff
    staff: [],
    totalStaff: 0,
    staffFilters: {
      pageNumber: 1,
      pageSize: 10,
      searchTerm: '',
      email: '',
      phoneNumber: '',
    },

    loading: false,
    error: null,
  }),

  actions: {
    /** ================== CUSTOMERS ================== */
    async fetchCustomers(customParams = {}) {
      this.loading = true
      this.error = null
      try {
        const params = { ...this.customerFilters, ...customParams }
        const res = await getCustomers(params)

        this.customers = res.data.data || res.data
        this.totalCustomers = res.data.totalCount || res.totalCount
        this.customerFilters.pageNumber = res.data.pageNumber || res.pageNumber
        this.customerFilters.pageSize = res.data.pageSize || res.pageSize
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tải khách hàng'
      } finally {
        this.loading = false
      }
    },

    /** ================== STAFF ================== */
    async fetchStaff(customParams = {}) {
      this.loading = true
      this.error = null
      try {
        const params = { ...this.staffFilters, ...customParams }
        const res = await getStaff(params)

        this.staff = res.data.data
        this.totalStaff = res.data.totalCount
        this.staffFilters.pageNumber = res.data.pageNumber
        this.staffFilters.pageSize = res.data.pageSize
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tải nhân viên'
      } finally {
        this.loading = false
      }
    },

    /** ================== CRUD STAFF ================== */
    async addStaff(payload) {
      try {
        const res = await createStaff(payload)
        const newStaff = res.data.data || res.data
        this.staff.unshift(newStaff) // thêm vào đầu danh sách
        this.totalStaff++
        return res
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async editStaff(id, payload) {
      try {
        const res = await updateStaff(id, payload)
        const updatedStaff = res.data.data || res.data
        const index = this.staff.findIndex((s) => s.id === id)
        if (index !== -1) this.staff[index] = updatedStaff
        return res
      } catch (err) {
        throw err.response?.data || err
      }
    },

    async removeStaff(id) {
      try {
        await deleteStaff(id)
        this.staff = this.staff.filter((s) => s.id !== id)
        this.totalStaff--
      } catch (err) {
        throw err.response?.data || err
      }
    },
  },
})

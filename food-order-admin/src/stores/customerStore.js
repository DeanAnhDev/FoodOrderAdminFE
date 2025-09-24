import { defineStore } from 'pinia'
import customerService from '@/services/customerService'

export const useCustomerManagementStore = defineStore('customerManagement', {
  state: () => ({
    customers: [],
    currentCustomer: null,
    customerOrderHistory: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10,
    },
    searchResults: [],
  }),

  getters: {
    // Lấy khách hàng đang hoạt động
    activeCustomers: (state) => {
      return state.customers.filter((customer) => customer.isActive)
    },

    // Lấy khách hàng bị vô hiệu hóa
    inactiveCustomers: (state) => {
      return state.customers.filter((customer) => !customer.isActive)
    },

    // Kiểm tra có đang loading không
    isLoading: (state) => state.loading,

    // Lấy thông tin khách hàng hiện tại
    getCurrentCustomer: (state) => state.currentCustomer,

    // Lấy kết quả tìm kiếm
    getSearchResults: (state) => state.searchResults,
  },

  actions: {
    // Đặt trạng thái loading
    setLoading(status) {
      this.loading = status
    },

    // Đặt lỗi
    setError(error) {
      this.error = error
    },

    // Xóa lỗi
    clearError() {
      this.error = null
    },

    // Tạo khách hàng mới
    async createCustomer(customerData) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.createCustomer(customerData)

        if (response.data) {
          this.customers.unshift(response.data)
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Tạo khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Lấy danh sách khách hàng
    async fetchCustomers(params = {}) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.getCustomers(params)

        if (response.data) {
          this.customers = response.data
        }

        if (response.pagination) {
          this.pagination = response.pagination
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Lấy danh sách khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Lấy thông tin khách hàng theo ID
    async fetchCustomerById(customerId) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.getCustomerById(customerId)

        if (response.data) {
          this.currentCustomer = response.data
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Lấy thông tin khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Cập nhật thông tin khách hàng
    async updateCustomer(customerId, customerData) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.updateCustomer(customerId, customerData)

        if (response.data) {
          const index = this.customers.findIndex((c) => c.id === customerId)
          if (index !== -1) {
            this.customers[index] = response.data
          }

          if (this.currentCustomer && this.currentCustomer.id === customerId) {
            this.currentCustomer = response.data
          }
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Cập nhật khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Xóa khách hàng
    async deleteCustomer(customerId) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.deleteCustomer(customerId)

        // Xóa khỏi danh sách
        this.customers = this.customers.filter((c) => c.id !== customerId)

        // Xóa khỏi current customer nếu đang xem
        if (this.currentCustomer && this.currentCustomer.id === customerId) {
          this.currentCustomer = null
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Xóa khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Tìm kiếm khách hàng
    async searchCustomers(searchTerm) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.searchCustomers(searchTerm)

        if (response.data) {
          this.searchResults = response.data
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Tìm kiếm khách hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Lấy lịch sử đơn hàng của khách hàng
    async fetchCustomerOrderHistory(customerId, params = {}) {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await customerService.getCustomerOrderHistory(customerId, params)

        if (response.data) {
          this.customerOrderHistory = response.data
        }

        return response
      } catch (error) {
        this.setError(error.response?.data?.message || 'Lấy lịch sử đơn hàng thất bại')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Xóa kết quả tìm kiếm
    clearSearchResults() {
      this.searchResults = []
    },

    // Reset current customer
    clearCurrentCustomer() {
      this.currentCustomer = null
    },

    // Reset store
    resetStore() {
      this.customers = []
      this.currentCustomer = null
      this.customerOrderHistory = []
      this.loading = false
      this.error = null
      this.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 10,
      }
      this.searchResults = []
    },
  },
})

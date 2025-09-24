import axiosClient from '@/axiosClient'

const customerService = {
  // Tạo khách hàng mới
  async createCustomer(customerData) {
    try {
      const response = await axiosClient.post('User/customers', customerData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Lấy danh sách khách hàng
  async getCustomers(params = {}) {
    try {
      const response = await axiosClient.get('/customers', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Lấy thông tin khách hàng theo ID
  async getCustomerById(customerId) {
    try {
      const response = await axiosClient.get(`/customers/${customerId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Cập nhật thông tin khách hàng
  async updateCustomer(customerId, customerData) {
    try {
      const response = await axiosClient.put(`/customers/${customerId}`, customerData)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Xóa khách hàng
  async deleteCustomer(customerId) {
    try {
      const response = await axiosClient.delete(`/customers/${customerId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Tìm kiếm khách hàng
  async searchCustomers(searchTerm) {
    try {
      const response = await axiosClient.get('/customers/search', {
        params: { q: searchTerm },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Lấy lịch sử đơn hàng của khách hàng
  async getCustomerOrderHistory(customerId, params = {}) {
    try {
      const response = await axiosClient.get(`/customers/${customerId}/orders`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default customerService

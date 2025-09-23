import { defineStore } from 'pinia'
import { createOrder, getOrders, updateOrderStatus, getRevenue } from '@/services/orderService'

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null,
    paymentUrl: null,
    orders: [],
    total: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    hasPreviousPage: false,
    hasNextPage: false,
    loading: false,
    error: null,
    successMessage: null,

    // Query filter cho Orders
    orderQuery: {
      orderCode: null,
      status: null,
      paymentStatus: null,
      page: 1,
      pageSize: 10,
      sortBy: 'CreatedAt',
      sortOrder: 'desc',
    },

    // Query filter cho Revenue
    revenueQuery: {
      StartDate: null,
      EndDate: null,
      Period: 'daily', // 'daily', 'weekly', 'monthly', 'yearly'
    },

    revenue: null,
  }),

  actions: {
    /** ================= Revenue ================= */
    async fetchRevenue(customQuery = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await getRevenue({ ...this.revenueQuery, ...customQuery })
        this.revenue = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Không thể tải dữ liệu doanh thu'
      } finally {
        this.loading = false
      }
    },

    /** ================= Orders ================= */
    async fetchOrders(customQuery = {}) {
      this.loading = true
      this.error = null
      try {
        const finalQuery = {
          ...this.orderQuery,
          ...customQuery,
        }

        // Cập nhật query trong store
        this.orderQuery = { ...finalQuery }

        const res = await getOrders(finalQuery)

        // backend trả về { orders, totalCount, currentPage, pageSize, totalPages, hasPreviousPage, hasNextPage }
        this.orders = res.data.orders || []
        this.total = res.data.totalCount || 0
        this.currentPage = res.data.currentPage || 1
        this.totalPages = res.data.totalPages || 1
        this.pageSize = res.data.pageSize || 10
        this.hasPreviousPage = res.data.hasPreviousPage || false
        this.hasNextPage = res.data.hasNextPage || false
      } catch (err) {
        this.error = err.response?.data?.message || 'Không thể tải danh sách đơn hàng'
      } finally {
        this.loading = false
      }
    },

    async changeOrderStatus(request) {
      this.loading = true
      this.error = null
      this.successMessage = null
      try {
        const res = await updateOrderStatus(request)

        if (res.data.success) {
          this.successMessage = res.data.message
          this.currentOrder = res.data.order

          // Cập nhật trong list nếu có
          const idx = this.orders.findIndex((o) => o.id === res.data.order?.id)
          if (idx !== -1) {
            this.orders[idx] = res.data.order
          }
        } else {
          this.error = res.data.message || 'Cập nhật trạng thái thất bại'
        }

        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Có lỗi khi cập nhật trạng thái'
        throw err
      } finally {
        this.loading = false
      }
    },

    async submitOrder(orderData) {
      this.loading = true
      this.error = null
      this.successMessage = null
      try {
        const res = await createOrder(orderData)

        if (res.data.success) {
          this.currentOrder = res.data.order
          this.paymentUrl = res.data.paymentUrl
          this.successMessage = res.data.message
        } else {
          this.error = res.data.message || 'Tạo đơn hàng thất bại'
        }

        return res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Có lỗi khi tạo đơn hàng'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})

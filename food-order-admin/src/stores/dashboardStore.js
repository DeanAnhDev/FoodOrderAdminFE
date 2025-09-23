import { defineStore } from 'pinia'
import { getDashboardSummary } from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboardData: null,
    loading: false,
    error: null,

    // Query filter cho Dashboard
    dashboardQuery: {
      startDate: null,
      endDate: null,
    },
  }),

  getters: {
    // Tính toán phần trăm đơn hàng theo trạng thái
    orderStatusPercentages: (state) => {
      if (!state.dashboardData) return null

      const total = state.dashboardData.totalOrders
      if (total === 0)
        return {
          pending: 0,
          accepted: 0,
          processing: 0,
          done: 0,
          shipping: 0,
          completed: 0,
          cancelled: 0,
        }

      return {
        pending: Math.round((state.dashboardData.pendingOrders / total) * 100),
        accepted: Math.round((state.dashboardData.acceptedOrders / total) * 100),
        processing: Math.round((state.dashboardData.processingOrders / total) * 100),
        done: Math.round((state.dashboardData.doneOrders / total) * 100),
        shipping: Math.round((state.dashboardData.shippingOrders / total) * 100),
        completed: Math.round((state.dashboardData.completedOrders / total) * 100),
        cancelled: Math.round((state.dashboardData.cancelledOrders / total) * 100),
      }
    },

    // Format dữ liệu cho chart đơn hàng
    orderChartData: (state) => {
      if (!state.dashboardData) return null

      // Hiển thị tất cả trạng thái với màu sắc đẹp và dễ phân biệt
      const statuses = [
        {
          label: 'Chờ xác nhận',
          value: state.dashboardData.pendingOrders,
          color: '#fbbf24',
          borderColor: '#f59e0b',
        },
        {
          label: 'Đã xác nhận',
          value: state.dashboardData.acceptedOrders,
          color: '#60a5fa',
          borderColor: '#3b82f6',
        },
        {
          label: 'Đang xử lý',
          value: state.dashboardData.processingOrders,
          color: '#a78bfa',
          borderColor: '#8b5cf6',
        },
        {
          label: 'Hoàn thành chế biến',
          value: state.dashboardData.doneOrders,
          color: '#22d3ee',
          borderColor: '#06b6d4',
        },
        {
          label: 'Đang giao hàng',
          value: state.dashboardData.shippingOrders,
          color: '#fb923c',
          borderColor: '#f97316',
        },
        {
          label: 'Hoàn thành',
          value: state.dashboardData.completedOrders,
          color: '#34d399',
          borderColor: '#10b981',
        },
        {
          label: 'Đã hủy',
          value: state.dashboardData.cancelledOrders,
          color: '#f87171',
          borderColor: '#ef4444',
        },
      ].filter((status) => status.value > 0) // Chỉ hiển thị trạng thái có đơn hàng

      return {
        labels: statuses.map((s) => s.label),
        datasets: [
          {
            data: statuses.map((s) => s.value),
            backgroundColor: statuses.map((s) => s.color),
            borderColor: statuses.map((s) => s.borderColor),
            borderWidth: 1,
            hoverBackgroundColor: statuses.map((s) => s.borderColor),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 2,
            borderRadius: 4,
            borderJoinStyle: 'round',
          },
        ],
      }
    },

    // Top 5 sản phẩm bán chạy
    topProducts: (state) => {
      return state.dashboardData?.topProducts || []
    },
  },

  actions: {
    async fetchDashboardSummary(customQuery = {}) {
      this.loading = true
      this.error = null
      try {
        const finalQuery = {
          ...this.dashboardQuery,
          ...customQuery,
        }

        // Cập nhật query trong store
        this.dashboardQuery = { ...finalQuery }

        const res = await getDashboardSummary(finalQuery)
        this.dashboardData = res.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Không thể tải dữ liệu dashboard'
      } finally {
        this.loading = false
      }
    },

    // Set date range
    setDateRange(startDate, endDate) {
      this.dashboardQuery.startDate = startDate
      this.dashboardQuery.endDate = endDate
    },

    // Reset filters
    resetFilters() {
      this.dashboardQuery = {
        startDate: null,
        endDate: null,
      }
    },
  },
})

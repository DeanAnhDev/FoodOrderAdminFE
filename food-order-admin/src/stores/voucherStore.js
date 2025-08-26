import { defineStore } from 'pinia'
import {
  getVouchers,
  getVoucherById,
  addVoucher,
  updateVoucher,
  deleteVoucher,
} from '@/services/voucherService'

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    vouchers: [],
    voucher: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    },
    filters: {
      code: '',
      isActive: null,
      type: null,
      startDateFrom: null,
      startDateTo: null,
      endDateFrom: null,
      endDateTo: null,
      isOutOfStock: null,
      minOrderAmount: null,
    },
  }),

  actions: {
    async fetchVouchers() {
      this.loading = true
      this.error = null
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.filters,
        }

        const response = await getVouchers(params)
        this.vouchers = response.data.items || []
        this.pagination.totalItems = response.data.totalItems || 0
        this.pagination.totalPages = response.data.totalPages || 0
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tải danh sách voucher'
      } finally {
        this.loading = false
      }
    },

    async fetchVoucherById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await getVoucherById(id)
        this.voucher = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tải thông tin voucher'
      } finally {
        this.loading = false
      }
    },

    async createVoucher(data) {
      this.error = null
      try {
        await addVoucher(data)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tạo voucher'
        throw err
      }
    },

    async updateVoucher(data) {
      this.error = null
      try {
        await updateVoucher(data)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi cập nhật voucher'
        throw err
      }
    },

    async removeVoucher(id) {
      this.error = null
      try {
        await deleteVoucher(id)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi xóa voucher'
        throw err
      }
    },

    setPage(page) {
      this.pagination.page = page
    },

    setPageSize(size) {
      this.pagination.pageSize = size
      this.pagination.page = 1 // Reset về trang 1 khi thay đổi pageSize
    },

    setFilters(filters) {
      this.filters = { ...filters }
      this.pagination.page = 1 // Reset về trang 1 khi thay đổi bộ lọc
    },
  },
})

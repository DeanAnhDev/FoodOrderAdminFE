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
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.filters,
        }

        const response = await getVouchers(params)
        this.vouchers = response.data.items || []
        this.pagination.totalItems = response.data.totalItems
        this.pagination.totalPages = response.data.totalPages
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async fetchVoucherById(id) {
      this.loading = true
      try {
        const response = await getVoucherById(id)
        this.voucher = response.data
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async createVoucher(data) {
      await addVoucher(data)
      await this.fetchVouchers()
    },

    async updateVoucher(data) {
      await updateVoucher(data)
      await this.fetchVouchers()
    },

    async removeVoucher(id) {
      await deleteVoucher(id)
      await this.fetchVouchers()
    },

    setPage(page) {
      this.pagination.page = page
    },

    setPageSize(size) {
      this.pagination.pageSize = size
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
  },
})

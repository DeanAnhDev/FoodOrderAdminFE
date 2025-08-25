import { defineStore } from 'pinia'
import voucherService from '@/services/voucherService'

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    vouchers: {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
      pageSize: 10,
    },
    loading: false,
    error: null,
  }),

  actions: {
    // Lấy danh sách voucher (có phân trang, filter)
    async fetchVouchers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const data = await voucherService.getAll(params)

        this.vouchers = {
          items: data.items || [],
          pageNumber: data.pageNumber || 1,
          totalPages: data.totalPages || 1,
          totalCount: data.totalCount || 0,
          pageSize: data.pageSize || params.pageSize || 10,
        }
      } catch (err) {
        this.error = err.response?.data || err.message
      } finally {
        this.loading = false
      }
    },

    // Lấy chi tiết 1 voucher
    async getVoucherById(id) {
      try {
        return await voucherService.getById(id)
      } catch (err) {
        this.error = err.response?.data || err.message
        return null
      }
    },

    // Tạo mới voucher
    async createVoucher(data) {
      this.loading = true
      try {
        await voucherService.create(data)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data || err.message
      } finally {
        this.loading = false
      }
    },

    // Cập nhật voucher
    async updateVoucher(data) {
      this.loading = true
      try {
        await voucherService.update(data)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data || err.message
      } finally {
        this.loading = false
      }
    },

    // Xóa voucher
    async deleteVoucher(id) {
      this.loading = true
      try {
        await voucherService.delete(id)
        await this.fetchVouchers()
      } catch (err) {
        this.error = err.response?.data || err.message
      } finally {
        this.loading = false
      }
    },
  },
})

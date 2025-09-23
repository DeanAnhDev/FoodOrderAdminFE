// src/stores/promotionStore.js
import { defineStore } from 'pinia'
import {
  getPromotions,
  getPromotionById,
  addPromotion,
  updatePromotion,
  deletePromotion,
} from '@/services/promotionService'

export const usePromotionStore = defineStore('promotion', {
  state: () => ({
    promotions: [],
    currentPromotion: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    },
    filters: {
      name: '',
      status: null,
      sortOrder: 'desc',
    },
  }),

  actions: {
    async fetchPromotions() {
      this.loading = true
      try {
        const params = {
          pageNumber: this.pagination.page,
          pageSize: this.pagination.pageSize,
          startDateFrom: this.filters.startDateFrom || undefined,
          startDateTo: this.filters.startDateTo || undefined,
          isActive: this.filters.isActive !== null ? this.filters.isActive : undefined,
        }

        const response = await getPromotions(params)
        this.promotions = response.data.items || []
        this.pagination.totalItems = response.data.totalItems
        this.pagination.totalPages = response.data.totalPages
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async fetchPromotionById(id) {
      this.loading = true
      try {
        const response = await getPromotionById(id)
        this.currentPromotion = response.data
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async createPromotion(data) {
      await addPromotion(data)
      await this.fetchPromotions()
    },

    async updatePromotion(id, data) {
      await updatePromotion(id, data)
      await this.fetchPromotions()
    },

    async removePromotion(id) {
      await deletePromotion(id)
      await this.fetchPromotions()
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

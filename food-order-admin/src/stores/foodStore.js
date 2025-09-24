// src/stores/foodStore.js
import { defineStore } from 'pinia'
import {
  getFoods,
  addFood,
  updateFood,
  deleteFood,
  updateFoodStatus,
  searchFoodsAndCombos,
} from '@/services/foodService'

export const useFoodStore = defineStore('food', {
  state: () => ({
    foods: [],
    searchResults: [],
    loading: false,
    searchLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    },
    filters: {
      name: '',
      categoryName: '',
      status: null,
      isOutOfStock: null,
      sortOrder: 'desc',
    },
  }),

  actions: {
    async fetchFoods() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          sortOrder: this.filters.sortOrder,
          name: this.filters.name || undefined,
          categoryName: this.filters.categoryName || undefined,
          status: this.filters.status !== null ? this.filters.status : undefined,
          isOutOfStock: this.filters.isOutOfStock !== null ? this.filters.isOutOfStock : undefined,
        }

        const response = await getFoods(params)
        this.foods = response.data.items || []
        this.pagination.totalItems = response.data.totalItems
        this.pagination.totalPages = response.data.totalPages
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async createFood(data) {
      await addFood(data)
      await this.fetchFoods()
    },

    async updateFood(data) {
      await updateFood(data)
      await this.fetchFoods()
    },

    async removeFood(id) {
      await deleteFood(id)
      await this.fetchFoods()
    },

    async updateFoodStatusAction(id, isActive) {
      await updateFoodStatus(id, isActive) // gọi API
      const food = this.foods.find((f) => f.foodId === id)
      if (food) food.status = isActive // cập nhật UI
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

    async searchFoodsAndCombos(name) {
      this.searchLoading = true
      this.error = null
      try {
        const response = await searchFoodsAndCombos(name)
        this.searchResults = response.data.data || []
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Lỗi khi tìm kiếm sản phẩm'
        throw err
      } finally {
        this.searchLoading = false
      }
    },

    clearSearchResults() {
      this.searchResults = []
    },
  },
})

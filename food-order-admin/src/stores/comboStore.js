import { defineStore } from 'pinia'
import { getCombos, createCombo, updateCombo, getComboById, getAllFoods } from '@/services/comboServices'

export const useComboStore = defineStore('combo', {
  state: () => ({
    combos: [],
    selectedCombo: null,
    comboDetails: [],
    allFoods: [],
    availableFoods: [], 
    loading: false,
    error: null,
    pagination: {
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      totalCount: 0,
    },
  }),

  actions: {
    async fetchCombos(query = {}) {
      this.loading = true
      try {
        const res = await getCombos(query)
        this.combos = res.data.items
        this.pagination = {
          pageNumber: res.data.pageNumber,
          pageSize: res.data.pageSize,
          totalPages: res.data.totalPages,
          totalCount: res.data.totalCount,
        }
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async fetchComboById(id) {
      this.loading = true
      try {
        const res = await getComboById(id)
        this.selectedCombo = res.data
        this.comboDetails = res.data.comboDetails || []
        return res
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async fetchAllFoods() {
      try {
        const res = await getAllFoods()
        this.allFoods = res.data
      } catch (err) {
        this.error = err
      }
    },

    async fetchAvailableFoods(comboId) {
      try {
        await this.fetchComboById(comboId)
        await this.fetchAllFoods()
        const comboFoodIds = this.comboDetails.map(d => d.foodId)
        this.availableFoods = this.allFoods.filter(f => !comboFoodIds.includes(f.foodId))
      } catch (err) {
        this.error = err
      }
    },

    async createCombo(data) {
      this.loading = true
      try {
        await createCombo(data)
        await this.fetchCombos()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async updateCombo(data) {
      this.loading = true
      try {
        await updateCombo(data)
        await this.fetchCombos()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },
  },
})

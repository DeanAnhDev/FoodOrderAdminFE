import { defineStore } from 'pinia'
import { getCategories, addCategory, updateCategory } from '@/services/categoryService'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const response = await getCategories()
        this.categories = response.data
        console.log('Categories fetched:', response.data)
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },
    async createCategory(data) {
      await addCategory(data)
      await this.fetchCategories()
    },
    async updateCategory(data) {
      await updateCategory(data)
      await this.fetchCategories()
    },
    async removeCategory(id) {
      await deleteCategory(id)
      await this.fetchCategories()
    }
  }
})
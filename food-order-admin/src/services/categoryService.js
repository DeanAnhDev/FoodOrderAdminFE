import axiosClient from '@/axiosClient'

export const getCategories = async () => {
  return axiosClient.get('/FoodCategory')
}

export const addCategory = async (category) => {
  return axiosClient.post('/FoodCategory', category)
}

export const updateCategory = async (category) => {
  return axiosClient.put(`/FoodCategory`, category)
}
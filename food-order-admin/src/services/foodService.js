import axiosClient from '@/axiosClient'

export const getFoods = async (params) => {
  return axiosClient.get('/Food', { params })
}

export const addFood = async (food) => {
  return axiosClient.post('/Food', food)
}

export const updateFood = async (food) => {
  return axiosClient.put(`/Food`, food)
}

export const deleteFood = async (id) => {
  return axiosClient.put(`/Food`, id)
}
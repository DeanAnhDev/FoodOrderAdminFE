import axiosClient from '@/axiosClient'

export const getCombos = (query) => {
  return axiosClient.get('Combo', { params: query })
}

export const createCombo = (data) => {
  return axiosClient.post('Combo', data)
}

export const updateCombo = (data) => {
  return axiosClient.put('Combo', data)
}

export const deleteCombo = (id) => {
  return axiosClient.delete(`Combo/${id}`)
}

export const getComboById = (id) => {
  return axiosClient.get(`Combo/${id}`)
}

export const getAllFoods = () => {
  return axiosClient.get(`Combo/foods`)
}


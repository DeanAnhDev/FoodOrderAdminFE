import axiosClient from '@/axiosClient'

export const getCurrentUser = () => {
  return axiosClient.get('/User')
}

export const updateUser = (data) => {
  return axiosClient.put('/User', data)
}

export const changePassword = (data) => {
  return axiosClient.put('/User/change-password', data)
}

export const getCustomers = async (params) => {
  return axiosClient.get('/User/customers', { params })
}

export const getUserById = async (userId) => {
  return axiosClient.get(`/User/${userId}`)
}

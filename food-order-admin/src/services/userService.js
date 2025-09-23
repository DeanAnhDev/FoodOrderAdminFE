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

// Staff APIs
export const getStaff = async (params) => {
  return axiosClient.get('/User/staff', { params })
}

export const createStaff = async (staffData) => {
  return axiosClient.post('/User/staff', staffData)
}

export const updateStaff = async (id, staffData) => {
  return axiosClient.put(`/User/staff/${id}`, staffData)
}

export const deleteStaff = async (id) => {
  return axiosClient.delete(`/User/staff/${id}`)
}

export const getStaffById = async (staffId) => {
  return axiosClient.get(`/User/staff/${staffId}`)
}

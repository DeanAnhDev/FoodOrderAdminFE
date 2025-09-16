import axiosClient from '@/axiosClient'

export const getVouchers = async (params) => {
  return axiosClient.get('/Voucher', { params })
}

export const getVoucherById = async (id) => {
  return axiosClient.get(`/Voucher/${id}`)
}

export const addVoucher = async (voucher) => {
  return axiosClient.post('/Voucher', voucher)
}

export const updateVoucher = async (voucher) => {
  return axiosClient.put('/Voucher', voucher)
}

export const deleteVoucher = async (id) => {
  return axiosClient.delete(`/Voucher/${id}`)
}

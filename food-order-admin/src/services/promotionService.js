import axiosClient from '@/axiosClient'

// Lấy danh sách khuyến mãi (có thể truyền query param)
export const getPromotions = async (params) => {
  return axiosClient.get('/Promotion', { params })
}

// Lấy chi tiết khuyến mãi theo id
export const getPromotionById = async (id) => {
  return axiosClient.get(`/Promotion/${id}`)
}

// Thêm mới khuyến mãi
export const addPromotion = async (promotion) => {
  return axiosClient.post('/Promotion', promotion)
}

// Cập nhật khuyến mãi
export const updatePromotion = async (id, promotion) => {
  return axiosClient.put(`/Promotion/${id}`, promotion)
}

// Xóa khuyến mãi
export const deletePromotion = async (id) => {
  return axiosClient.delete(`/Promotion/${id}`)
}

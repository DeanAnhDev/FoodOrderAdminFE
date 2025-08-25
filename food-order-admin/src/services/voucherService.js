import axiosClient from '@/axiosClient'

const voucherService = {
  // Lấy tất cả voucher (có phân trang, filter)
  getAll(params) {
    return axiosClient.get('/Voucher', { params }).then((res) => res.data)
  },

  // Lấy chi tiết 1 voucher theo id
  getById(id) {
    return axiosClient.get(`/Voucher/${id}`).then((res) => res.data)
  },

  // Tạo mới voucher
  create(data) {
    return axiosClient.post('/Voucher', data)
  },

  // Cập nhật voucher
  update(voucher) {
    return axiosClient.put('/Voucher', voucher) // không cần bọc { voucherDto: ... } nữa
  },

  // Xóa voucher
  delete(id) {
    return axiosClient.delete(`/Voucher/${id}`)
  },
}

export default voucherService

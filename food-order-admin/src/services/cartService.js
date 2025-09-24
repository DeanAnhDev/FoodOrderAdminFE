// services/cartService.js
import axiosClient from '@/axiosClient'

export default {
  async getCart() {
    return await axiosClient.get('/cart')
  },
  async addItem({ foodId, comboId, quantity }) {
    return await axiosClient.post('/cart', { foodId, comboId, quantity })
  },
  async updateItem(cartItemId, quantity) {
    return await axiosClient.put(`/cart`, { cartItemId, quantity })
  },
  async removeItem(cartItemId) {
    return await axiosClient.delete(`/cart`, { data: { cartItemId } })
  },

  // Temporary cart APIs
  async createTemporaryCart() {
    return await axiosClient.post('/cart/temporary')
  },
  async assignCartToUser(cartId, userId) {
    return await axiosClient.put(`/cart/assign/${cartId}`, null, { params: { userId } })
  },
  async getTemporaryCarts() {
    return await axiosClient.get('/cart/temporary')
  },

  // Get specific cart by id
  async getCartById(cartId) {
    return await axiosClient.get(`/cart/${cartId}`)
  },

  // Delete temporary cart
  async deleteTemporaryCart(cartId) {
    return await axiosClient.delete(`/cart/temporary/${cartId}`)
  },

  // Add item to specific cart by ID
  async addToCartById({ cartId, foodId, comboId, quantity }) {
    return await axiosClient.post('/cart/add-by-id', {
      cartId,
      foodId,
      comboId,
      quantity,
    })
  },

  // Update item in specific cart by ID
  async updateCartItemById({ cartId, foodId, comboId, quantity }) {
    return await axiosClient.put('/cart/update-by-id', {
      cartId,
      foodId,
      comboId,
      quantity,
    })
  },

  // Delete cart by ID
  async deleteCartById(cartId) {
    return await axiosClient.delete(`/cart/${cartId}`)
  },

  // Delete specific item from cart
  async deleteCartItem({ cartId, cartItemId }) {
    return await axiosClient.delete('/cart/delete-item', {
      data: { cartId, cartItemId },
    })
  },
}

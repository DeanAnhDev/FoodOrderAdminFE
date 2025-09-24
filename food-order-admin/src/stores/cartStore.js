// stores/cart.js
import { defineStore } from 'pinia'
import cartService from '@/services/cartService'
import { ref } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const subtotal = ref(0)
  const totalQuantity = ref(0)
  const cartId = ref(null)
  const temporaryCarts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const originalTotal = ref(0)
  const totalDiscount = ref(0)

  const fetchCart = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await cartService.getCart()
      const cart = response.data.cart || {}
      items.value = cart.cartItems || []
      cartId.value = cart.id || cart.cartId || null
      subtotal.value = response.data.subtotal
      totalQuantity.value = response.data.totalQuantity
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi tải giỏ hàng'
    } finally {
      loading.value = false
    }
  }

  // Helper function to calculate promotion pricing
  const calculatePromotionPrice = (product) => {
    const originalPrice = product.price || 0
    const promotion = product.promotion

    if (!promotion || !promotion.isActive) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discountAmount: 0,
      }
    }

    // Check if promotion is still valid
    const now = new Date()
    const startDate = new Date(promotion.startDate)
    const endDate = new Date(promotion.endDate)

    if (now < startDate || now > endDate) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discountAmount: 0,
      }
    }

    let finalPrice = originalPrice
    let discountAmount = 0

    if (promotion.type === 'Percentage') {
      discountAmount = originalPrice * (promotion.discountAmount / 100)
      finalPrice = originalPrice - discountAmount
    } else if (promotion.type === 'Amount') {
      discountAmount = promotion.discountAmount
      finalPrice = Math.max(0, originalPrice - discountAmount)
    }

    return {
      originalPrice,
      finalPrice,
      discountAmount,
    }
  }

  const fetchCartById = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.getCartById(id)
      // API contract per controller: { success, message, data }
      const payload = res.data?.data ?? res.data
      const cart = payload?.cart || payload || {}

      // Calculate totals
      let calculatedSubtotal = 0
      let calculatedOriginalTotal = 0
      let calculatedTotalDiscount = 0

      // Map cart items with proper structure and calculate pricing
      items.value = (cart.cartItems || []).map((item) => {
        const product = item.food || item.combo
        const pricing = calculatePromotionPrice(product)

        const itemOriginalTotal = pricing.originalPrice * item.quantity
        const itemFinalTotal = pricing.finalPrice * item.quantity
        const itemDiscountAmount = pricing.discountAmount * item.quantity

        // Add to totals
        calculatedOriginalTotal += itemOriginalTotal
        calculatedSubtotal += itemFinalTotal
        calculatedTotalDiscount += itemDiscountAmount

        return {
          id: item.cartItemId,
          cartItemId: item.cartItemId,
          foodId: item.foodId,
          comboId: item.comboId,
          quantity: item.quantity,
          originalPrice: pricing.originalPrice,
          finalPrice: pricing.finalPrice,
          originalTotal: itemOriginalTotal,
          finalTotal: itemFinalTotal,
          discountAmount: pricing.discountAmount,
          // Food/Combo info
          name: product?.foodName || product?.comboName || 'Unknown',
          image: product?.images?.url,
          description: product?.description,
          type: item.foodId ? 'food' : 'combo',
          // Product details
          food: item.food,
          combo: item.combo,
        }
      })

      cartId.value = cart.cartId || id

      // Use calculated values (since backend returns 0 for these fields)
      subtotal.value = calculatedSubtotal
      totalQuantity.value = items.value.reduce((s, i) => s + (i.quantity || 0), 0)
      originalTotal.value = calculatedOriginalTotal
      totalDiscount.value = calculatedTotalDiscount

      return {
        ...cart,
        subtotal: subtotal.value,
        totalQuantity: totalQuantity.value,
        originalTotal: originalTotal.value,
        totalDiscount: totalDiscount.value,
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi tải giỏ hàng theo ID'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addToCart = async ({ foodId = null, comboId = null, quantity = 1 }) => {
    try {
      await cartService.addItem({ foodId, comboId, quantity })
      await fetchCart()
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng'
    }
  }

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await cartService.updateItem(cartItemId, quantity)
      await fetchCart()
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng'
      await fetchCart()
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId)
      await fetchCart()
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi xóa món khỏi giỏ'
      await fetchCart()
    }
  }

  const clearCart = () => {
    items.value = []
    subtotal.value = 0
    totalQuantity.value = 0
    cartId.value = null
    error.value = null
  }

  // ===== Temporary cart features =====
  const createTemporaryCart = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.createTemporaryCart()
      const cart = res.data
      // Optionally set current cart to the newly created temporary cart
      cartId.value = cart.id || cart.cartId || null
      items.value = cart.cartItems || []
      subtotal.value = cart.subtotal ?? 0
      totalQuantity.value = cart.totalQuantity ?? 0
      return cart
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi tạo giỏ hàng tạm thời'
      throw err
    } finally {
      loading.value = false
    }
  }

  const assignCartToUser = async (assignCartId, userId) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.assignCartToUser(assignCartId, userId)
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi gán giỏ hàng cho người dùng'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTemporaryCarts = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.getTemporaryCarts()
      temporaryCarts.value = res.data || []
      return temporaryCarts.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi tải danh sách giỏ hàng tạm thời'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTemporaryCart = async (cartId) => {
    loading.value = true
    error.value = null
    try {
      await cartService.deleteTemporaryCart(cartId)
      // Remove from local temporaryCarts array
      temporaryCarts.value = temporaryCarts.value.filter(
        (cart) => (cart.id || cart.cartId) !== cartId,
      )
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi xóa đơn hàng chờ'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addToCartById = async ({ cartId, foodId = null, comboId = null, quantity = 1 }) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.addToCartById({ cartId, foodId, comboId, quantity })
      // Return success result
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCartItemById = async ({ cartId, foodId = null, comboId = null, quantity }) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.updateCartItemById({ cartId, foodId, comboId, quantity })
      // Return success result
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCartById = async (cartId) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.deleteCartById(cartId)
      // If we deleted the current cart, clear the local state
      if (cartId.value === cartId) {
        items.value = []
        subtotal.value = 0
        totalQuantity.value = 0
        cartId.value = null
      }
      // Also remove from temporary carts if it exists there
      temporaryCarts.value = temporaryCarts.value.filter(
        (cart) => (cart.id || cart.cartId) !== cartId,
      )
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi xóa giỏ hàng'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCartItem = async ({ cartId, cartItemId }) => {
    loading.value = true
    error.value = null
    try {
      const res = await cartService.deleteCartItem({ cartId, cartItemId })
      // Return success result
      return res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Lỗi khi xóa sản phẩm khỏi giỏ hàng'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    subtotal,
    totalQuantity,
    cartId,
    temporaryCarts,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCartById,
    createTemporaryCart,
    assignCartToUser,
    fetchTemporaryCarts,
    deleteTemporaryCart,
    addToCartById,
    updateCartItemById,
    deleteCartById,
    deleteCartItem,
  }
})

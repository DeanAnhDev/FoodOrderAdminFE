<template>
    <div class="pos-container min-h-screen bg-white">
        <!-- Header with Order Management -->
        <div class="bg-white shadow-sm px-6 py-4 border-b">
            <div class="flex items-center justify-between">
                <h1 class="text-2xl font-bold text-gray-800">Bán hàng tại quầy</h1>
                <div class="flex items-center gap-3">
                    <button @click="loadTemporaryCarts" :disabled="loadingTempCarts"
                        class="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                        <i v-if="!loadingTempCarts" class="fas fa-sync-alt"></i>
                        <i v-else class="fas fa-spinner fa-spin"></i>
                        <span>Làm mới</span>
                    </button>
                    <button @click="handleCreateTemporaryOrder" :disabled="creatingTemp"
                        class="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <i v-if="!creatingTemp" class="fas fa-plus-circle"></i>
                        <i v-else class="fas fa-spinner fa-spin"></i>
                        <span>Tạo đơn mới</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Current Order Status -->
        <div class="bg-blue-50 border-b px-6 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-shopping-cart text-blue-600"></i>
                        <span class="font-medium text-blue-800">
                            {{ currentCartId ? `Đơn hàng #${currentCartId}` : 'Chưa chọn đơn hàng' }}
                        </span>
                    </div>
                    <div v-if="currentCartId && totalItems > 0" class="text-sm text-blue-600">
                        {{ totalItems }} phần • {{ formatCurrency(subtotal) }}
                    </div>
                </div>
                <div v-if="!currentCartId" class="text-sm text-blue-600">
                    Tạo đơn mới hoặc chọn đơn có sẵn để bắt đầu
                </div>
            </div>
        </div>

        <!-- Orders Tab List -->
        <div v-if="temporaryCarts.length > 0" class="bg-white border-b">
            <div class="px-6 py-2">
                <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <span class="text-sm font-medium text-gray-600 whitespace-nowrap mr-3">
                        Đơn hàng chờ ({{ temporaryCarts.length }}):
                    </span>
                    <div class="flex gap-2">
                        <div v-for="tempCart in temporaryCarts" :key="tempCart.id || tempCart.cartId"
                            class="relative group flex-shrink-0">
                            <button @click="selectTemporaryCart(tempCart)" :class="[
                                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                                (currentCartId === (tempCart.id || tempCart.cartId))
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            ]">
                                <i class="fas fa-receipt text-xs"></i>
                                <span>#{{ tempCart.id || tempCart.cartId }}</span>
                                <span v-if="tempCart.cartItems?.length > 0" class="px-2 py-1 rounded-full text-xs"
                                    :class="[
                                        (currentCartId === (tempCart.id || tempCart.cartId))
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    ]">
                                    {{ tempCart.cartItems.length }}
                                </span>
                                <button @click.stop="handleDeleteTemporaryCart(tempCart)" :class="[
                                    'ml-1 w-4 h-4 rounded-full hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center',
                                    (currentCartId === (tempCart.id || tempCart.cartId))
                                        ? 'text-blue-200 hover:bg-red-600'
                                        : 'text-gray-400'
                                ]">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex h-full min-h-0 overflow-hidden">
            <!-- Left Panel - Product Selection -->
            <div class="flex-1 min-w-0 min-h-0 p-6 overflow-y-auto">
                <!-- Search -->
                <div class="mb-6">
                    <div class="relative">
                        <input v-model="searchQuery" type="text" placeholder="Tìm kiếm món ăn, combo..."
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <i v-if="!isSearching"
                            class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <i v-else
                            class="fas fa-spinner fa-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
                    </div>
                    <div v-if="searchQuery && filteredItems.length === 0 && !isSearching"
                        class="text-sm text-gray-500 mt-2">
                        Không tìm thấy sản phẩm nào
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
                    <div v-for="item in filteredItems" :key="item.id" @click="addToCart(item)" :class="[
                        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow relative',
                        !item.status || item.quantity <= 0 ? 'opacity-60' : ''
                    ]">
                        <!-- Out of stock overlay -->
                        <div v-if="!item.status || item.quantity <= 0"
                            class="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                            <span class="text-white font-bold text-lg">{{ !item.status ? 'Ngừng bán' : 'Hết hàng'
                            }}</span>
                        </div>

                        <!-- Promotion badge -->
                        <div v-if="item.promotion && item.promotion.isActive"
                            class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-20">
                            {{ item.promotion.type === 'Percentage' ? '-' + item.promotion.discountAmount + '%' : '-' +
                                formatCurrency(item.promotion.discountAmount) }}
                        </div>

                        <div
                            class="aspect-square bg-white rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                            <img v-if="item.image" :src="item.image" :alt="item.name"
                                class="w-full h-full object-cover" />
                            <div v-else class="text-gray-400">
                                <i class="fas fa-utensils text-4xl"></i>
                            </div>
                        </div>
                        <h3 class="font-medium text-gray-900 mb-1 line-clamp-2">{{ item.name }}</h3>
                        <p class="text-sm text-gray-600 mb-2 line-clamp-2">{{ item.description }}</p>
                        <div class="text-xs text-gray-500 mb-2">
                            Còn lại: {{ item.quantity }}
                        </div>
                        <div class="flex justify-between items-center">
                            <div class="flex flex-col">
                                <!-- Original price (crossed out if there's promotion) -->
                                <span v-if="item.promotion && item.promotion.isActive"
                                    class="text-sm text-gray-500 line-through">
                                    {{ formatCurrency(item.price) }}
                                </span>
                                <!-- Final price -->
                                <span class="text-lg font-bold text-blue-600">
                                    {{ formatCurrency(getFinalPrice(item)) }}
                                </span>
                            </div>
                            <button :disabled="!item.status || item.quantity <= 0" :class="[
                                'p-2 rounded-lg transition-colors',
                                (!item.status || item.quantity <= 0)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            ]">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Load more or pagination if needed -->
                <div v-if="loading" class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </div>

            <!-- Right Panel - Cart & Checkout -->
            <div
                class="w-full md:w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col min-h-0 overflow-hidden">
                <!-- Cart Header -->
                <div class="p-6 border-b border-gray-200">
                    <div>
                        <h2 class="text-xl font-bold text-gray-800">Đơn hàng</h2>
                        <p v-if="totalItems > 0" class="text-sm text-gray-500">{{ totalItems }} phần</p>
                    </div>
                </div>

                <!-- Cart Items -->
                <div class="flex-1 overflow-y-auto p-6">
                    <div v-if="cartItems.length === 0" class="text-center text-gray-500 py-8">
                        <i class="fas fa-shopping-cart text-4xl mb-4 text-gray-300"></i>
                        <p>Chưa có món nào trong đơn hàng</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="item in cartItems" :key="item.id" class="flex items-center bg-white rounded-lg p-3">
                            <div
                                class="w-12 h-12 bg-white rounded-lg mr-3 flex items-center justify-center overflow-hidden">
                                <img v-if="item.image" :src="item.image" :alt="item.name"
                                    class="w-full h-full object-cover" />
                                <i v-else class="fas fa-utensils text-gray-400"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900 text-sm">{{ item.name }}</h4>
                                <div class="flex flex-col">
                                    <!-- Original price (crossed out if there's discount) -->
                                    <span v-if="item.discountAmount > 0" class="text-xs text-gray-500 line-through">
                                        {{ formatCurrency(item.originalPrice) }}
                                    </span>
                                    <!-- Final price -->
                                    <p class="text-blue-600 font-bold text-sm">
                                        {{ formatCurrency(item.finalPrice || item.price) }}
                                    </p>
                                    <!-- Discount amount -->
                                    <span v-if="item.discountAmount > 0" class="text-xs text-red-600">
                                        -{{ formatCurrency(item.discountAmount) }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button @click="decreaseQuantity(item.id)"
                                    class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                                <button @click="increaseQuantity(item.id)"
                                    class="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                                <button @click="removeFromCart(item.id)"
                                    class="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center ml-2">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary & Checkout -->
                <div v-if="cartItems.length > 0" class="border-t border-gray-200 p-6">
                    <!-- Order Summary -->
                    <div class="space-y-2 mb-4">
                        <!-- Original total (if there are discounts) -->
                        <div v-if="cartStore.originalTotal > cartStore.subtotal"
                            class="flex justify-between text-sm text-gray-500">
                            <span>Tổng giá gốc:</span>
                            <span class="line-through">{{ formatCurrency(cartStore.originalTotal || 0) }}</span>
                        </div>
                        <!-- Total discount -->
                        <div v-if="cartStore.totalDiscount > 0" class="flex justify-between text-sm text-red-600">
                            <span>Tổng giảm giá:</span>
                            <span>-{{ formatCurrency(cartStore.totalDiscount || 0) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between font-bold text-lg">
                                <span>Tổng cộng:</span>
                                <span class="text-blue-600">{{ formatCurrency(total) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Checkout Buttons -->
                    <div class="space-y-2">
                        <button @click="showPaymentModal = true" :disabled="processing"
                            class="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">
                            <i class="fas fa-credit-card mr-2"></i>
                            Thanh toán
                        </button>
                        <button @click="saveOrder"
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
                            <i class="fas fa-save mr-2"></i>
                            Lưu đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payment Modal -->
        <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click="showPaymentModal = false">
            <div class="bg-white rounded-lg max-w-2xl w-full mx-4" @click.stop>
                <PaymentModal :order-total="total" :initial-payment-method="paymentMethod"
                    :initial-customer-name="customerName" @close="showPaymentModal = false"
                    @confirm="handlePaymentConfirm" />
            </div>
        </div>

        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click="showSuccessModal = false">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4" @click.stop>
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-2xl text-green-500"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h3>
                    <p class="text-gray-600 mb-4">
                        Đơn hàng #{{ lastOrderId }} đã được tạo thành công.
                    </p>
                    <div class="flex space-x-3">
                        <button @click="showReceiptModal = true"
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                            In hóa đơn
                        </button>
                        <button @click="showSuccessModal = false"
                            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Receipt Modal -->
        <div v-if="showReceiptModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click="showReceiptModal = false">
            <div class="bg-white rounded-lg max-w-lg w-full mx-4" @click.stop>
                <ReceiptModal :order="lastCompletedOrder" @close="showReceiptModal = false" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatCurrency } from '@/utils/format'
import { useFoodStore } from '@/stores/foodStore'
import { useComboStore } from '@/stores/comboStore'
import { useOrderStore } from '@/stores/orderStore'
import { useCartStore } from '@/stores/cartStore'
import ReceiptModal from '@/components/ReceiptModal.vue'
import PaymentModal from '@/components/PaymentModal.vue'

const router = useRouter()
const foodStore = useFoodStore()
const comboStore = useComboStore()
const orderStore = useOrderStore()
const cartStore = useCartStore()

// Data
const loading = ref(false)
const processing = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const cartItems = ref([])
const customerName = ref('')
const paymentMethod = ref('cash')
const showSuccessModal = ref(false)
const showReceiptModal = ref(false)
const showPaymentModal = ref(false)
const lastOrderId = ref('')
const lastCompletedOrder = ref(null)
const currentCartId = ref(null)
const creatingTemp = ref(false)
const loadingTempCarts = ref(false)
const temporaryCarts = computed(() => cartStore.temporaryCarts)

const allItems = computed(() => {
    // Always use search results if available (including empty search for all items)
    if (searchResults.value && (searchResults.value.foods || searchResults.value.combos)) {
        const items = []

        // Map foods
        if (searchResults.value.foods) {
            const foodItems = searchResults.value.foods.map(food => ({
                id: food.foodId,
                name: food.foodName,
                price: food.price,
                image: food.images ? food.images.url : null,
                description: food.description,
                categoryId: food.foodCategoryId,
                type: 'food',
                status: food.status,
                quantity: food.quantity,
                promotion: food.promotion
            }))
            items.push(...foodItems)
        }

        // Map combos
        if (searchResults.value.combos) {
            const comboItems = searchResults.value.combos.map(combo => ({
                id: combo.comboId,
                name: combo.comboName,
                price: combo.price,
                image: combo.images ? combo.images.url : null,
                description: combo.description,
                categoryId: combo.foodCategoryId,
                type: 'combo',
                status: combo.status,
                quantity: combo.quantity,
                promotion: combo.promotion
            }))
            items.push(...comboItems)
        }

        return items
    }

    // Fallback to empty array if no search results
    return []
})

const filteredItems = computed(() => {
    return allItems.value
})

const subtotal = computed(() => {
    // Use cartStore subtotal if available (backend calculated), otherwise calculate locally
    if (cartStore.subtotal > 0) {
        return cartStore.subtotal
    }
    return cartItems.value.reduce((sum, item) => sum + ((item.finalPrice || item.price) * item.quantity), 0)
})

const total = computed(() => {
    return subtotal.value // Total is just the subtotal (no tax)
})

const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

// Helper functions
const getFinalPrice = (item) => {
    if (!item.promotion || !item.promotion.isActive) {
        return item.price
    }

    const now = new Date()
    const startDate = new Date(item.promotion.startDate)
    const endDate = new Date(item.promotion.endDate)

    // Check if promotion is still valid
    if (now < startDate || now > endDate) {
        return item.price
    }

    if (item.promotion.type === 'Percentage') {
        return item.price * (1 - item.promotion.discountAmount / 100)
    } else if (item.promotion.type === 'Amount') {
        return Math.max(0, item.price - item.promotion.discountAmount)
    }

    return item.price
}

// Search functionality
let searchTimeout = null
const performSearch = async (query) => {
    isSearching.value = true
    try {
        // Always call search API, even with empty query to get all items
        const result = await foodStore.searchFoodsAndCombos(query ? query.trim() : '')
        searchResults.value = result.data || []
    } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
    } finally {
        isSearching.value = false
    }
}

const debouncedSearch = (query) => {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
        performSearch(query)
    }, 300) // 300ms delay
}

// Methods
const loadData = async () => {
    loading.value = true
    try {
        await Promise.all([
            loadTemporaryCarts(),
            performSearch('') // Load all items using search API
        ])
    } catch (error) {
        console.error('Error loading data:', error)
    } finally {
        loading.value = false
    }
}

const addToCart = async (item) => {
    if (!currentCartId.value) {
        alert('Vui lòng tạo đơn mới hoặc chọn đơn có sẵn trước khi thêm sản phẩm')
        return
    }

    // Check if item is available
    if (!item.status) {
        alert('Sản phẩm này đã ngừng bán')
        return
    }

    if (item.quantity <= 0) {
        alert('Sản phẩm này đã hết hàng')
        return
    }

    try {
        // Add to specific cart by ID using new API
        const foodId = item.type === 'food' ? item.id : null
        const comboId = item.type === 'combo' ? item.id : null

        await cartStore.addToCartById({
            cartId: currentCartId.value,
            foodId,
            comboId,
            quantity: 1
        })

        // Sync local cart with backend
        await syncCartFromBackend()
    } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Có lỗi khi thêm sản phẩm vào giỏ hàng')
    }
}

const removeFromCart = async (itemId) => {
    if (!currentCartId.value) return

    const item = cartItems.value.find(item => item.id === itemId)
    if (!item || !item.cartItemId) return

    try {
        await cartStore.deleteCartItem({
            cartId: currentCartId.value,
            cartItemId: item.cartItemId
        })

        // Sync local cart with backend
        await syncCartFromBackend()
    } catch (error) {
        console.error('Error removing item from cart:', error)
        alert('Có lỗi khi xóa sản phẩm khỏi giỏ hàng')
    }
}

const increaseQuantity = async (itemId) => {
    if (!currentCartId.value) return

    const item = cartItems.value.find(item => item.id === itemId)
    if (!item) return

    try {
        const foodId = item.type === 'food' ? item.id : null
        const comboId = item.type === 'combo' ? item.id : null

        await cartStore.updateCartItemById({
            cartId: currentCartId.value,
            foodId,
            comboId,
            quantity: item.quantity + 1
        })

        // Sync local cart with backend
        await syncCartFromBackend()
    } catch (error) {
        console.error('Error updating quantity:', error)
        alert('Có lỗi khi cập nhật số lượng')
    }
}

const decreaseQuantity = async (itemId) => {
    if (!currentCartId.value) return

    const item = cartItems.value.find(item => item.id === itemId)
    if (!item) return

    try {
        const foodId = item.type === 'food' ? item.id : null
        const comboId = item.type === 'combo' ? item.id : null
        const newQuantity = item.quantity - 1

        await cartStore.updateCartItemById({
            cartId: currentCartId.value,
            foodId,
            comboId,
            quantity: newQuantity
        })

        // Sync local cart with backend
        await syncCartFromBackend()
    } catch (error) {
        console.error('Error updating quantity:', error)
        alert('Có lỗi khi cập nhật số lượng')
    }
}

const clearCart = () => {
    cartItems.value = []
    customerName.value = ''
    showSuccessModal.value = false
    showReceiptModal.value = false
    showPaymentModal.value = false
}

const loadTemporaryCarts = async () => {
    loadingTempCarts.value = true
    try {
        await cartStore.fetchTemporaryCarts()
    } catch (error) {
        console.error('Error loading temporary carts:', error)
        alert('Có lỗi khi tải danh sách đơn hàng chờ')
    } finally {
        loadingTempCarts.value = false
    }
}

const selectTemporaryCart = async (tempCart) => {
    const cartId = tempCart.id || tempCart.cartId
    if (cartId === currentCartId.value) return

    try {
        currentCartId.value = cartId
        await syncCartFromBackend()
    } catch (error) {
        console.error('Error selecting temporary cart:', error)
        alert('Có lỗi khi chọn đơn hàng')
    }
}

const syncCartFromBackend = async () => {
    if (!currentCartId.value) return

    try {
        const cart = await cartStore.fetchCartById(currentCartId.value)
        // Use the mapped items from cartStore with calculated pricing
        cartItems.value = cartStore.items.map(item => ({
            id: item.foodId || item.comboId,
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.finalPrice, // Use calculated final price
            originalPrice: item.originalPrice,
            finalPrice: item.finalPrice,
            quantity: item.quantity,
            type: item.type,
            image: item.image,
            description: item.description,
            discountAmount: item.discountAmount,
            // Keep food/combo objects for additional info
            food: item.food,
            combo: item.combo
        }))
    } catch (error) {
        console.error('Error syncing cart from backend:', error)
        throw error
    }
}

const handleCreateTemporaryOrder = async () => {
    creatingTemp.value = true
    try {
        const cart = await cartStore.createTemporaryCart()
        currentCartId.value = cart?.id || cart?.cartId || null
        // Start fresh for the new temporary order
        cartItems.value = []
        customerName.value = ''
        paymentMethod.value = 'cash'

        // Reload temporary carts list to include the new one
        await loadTemporaryCarts()
    } catch (error) {
        console.error('Error creating temporary cart:', error)
        alert('Không thể tạo đơn hàng tạm thời. Vui lòng thử lại.')
    } finally {
        creatingTemp.value = false
    }
}

const handleDeleteTemporaryCart = async (tempCart) => {
    const cartId = tempCart.id || tempCart.cartId

    // Confirm deletion
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${cartId}?`)) {
        return
    }

    try {
        await cartStore.deleteTemporaryCart(cartId)

        // If we deleted the currently selected cart, clear the selection
        if (currentCartId.value === cartId) {
            currentCartId.value = null
            cartItems.value = []
            customerName.value = ''
            paymentMethod.value = 'cash'
        }

        // Show success message
        alert('Đã xóa đơn hàng thành công!')

    } catch (error) {
        console.error('Error deleting temporary cart:', error)
        alert('Không thể xóa đơn hàng. Vui lòng thử lại.')
    }
}

const handlePaymentConfirm = async (paymentData) => {
    if (cartItems.value.length === 0) return

    processing.value = true
    try {
        // Update customer info and payment method from modal
        customerName.value = paymentData.customerName
        paymentMethod.value = paymentData.paymentMethod

        const orderData = {
            customerName: paymentData.customerName || 'Khách hàng tại quầy',
            paymentMethod: paymentData.paymentMethod,
            customerPaid: paymentData.customerPaid,
            change: paymentData.change,
            items: cartItems.value.map(item => ({
                id: item.id,
                name: item.name,
                price: item.finalPrice || item.price, // Use final price after promotion
                originalPrice: item.originalPrice,
                finalPrice: item.finalPrice,
                discountAmount: item.discountAmount,
                quantity: item.quantity,
                type: item.type
            })),
            subtotal: subtotal.value,
            total: total.value,
            orderType: 'pos',
            status: 'completed'
        }

        const result = await orderStore.submitOrder(orderData)
        if (result.success) {
            lastOrderId.value = result.order?.id || Date.now().toString()
            lastCompletedOrder.value = {
                ...orderData,
                id: lastOrderId.value,
                createdAt: new Date()
            }

            // Close payment modal and clear cart
            showPaymentModal.value = false
            clearCart()
            showSuccessModal.value = true
        } else {
            throw new Error(result.message || 'Tạo đơn hàng thất bại')
        }
    } catch (error) {
        console.error('Error processing order:', error)
        alert('Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.')
    } finally {
        processing.value = false
    }
}

const saveOrder = async () => {
    if (cartItems.value.length === 0) return

    try {
        const orderData = {
            customerName: customerName.value || 'Khách hàng tại quầy',
            paymentMethod: paymentMethod.value,
            items: cartItems.value.map(item => ({
                id: item.id,
                name: item.name,
                price: item.finalPrice || item.price, // Use final price after promotion
                originalPrice: item.originalPrice,
                finalPrice: item.finalPrice,
                discountAmount: item.discountAmount,
                quantity: item.quantity,
                type: item.type
            })),
            subtotal: subtotal.value,
            total: total.value,
            orderType: 'pos',
            status: 'pending'
        }

        const result = await orderStore.submitOrder(orderData)
        if (result.success) {
            clearCart()
            alert('Đơn hàng đã được lưu thành công!')
        } else {
            throw new Error(result.message || 'Lưu đơn hàng thất bại')
        }
    } catch (error) {
        console.error('Error saving order:', error)
        alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.')
    }
}

// Watchers
watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery)
})

// Lifecycle
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.pos-container {
    height: calc(100vh - 60px);
    /* Adjust based on your navbar height */
}

.scrollbar-hide {
    -ms-overflow-style: none;
    /* Internet Explorer 10+ */
    scrollbar-width: none;
    /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
    /* Safari and Chrome */
}

@media print {
    .pos-container {
        display: none;
    }
}
</style>
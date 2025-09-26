<template>
    <div class="pos-container h-screen bg-white flex flex-col">
        <!-- Header with Order Management -->
        <div class="bg-white shadow-sm px-6 py-3 border-b flex-shrink-0">
            <div class="flex items-center justify-between">
                <h1 class="text-xl font-bold text-gray-800">Bán hàng tại quầy</h1>
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
        <div class="bg-blue-50 border-b px-6 py-2 flex-shrink-0">
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
        <div v-if="temporaryCarts.length > 0" class="bg-white border-b flex-shrink-0">
            <div class="px-6 py-2">
                <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <span class="text-sm font-medium text-gray-600 whitespace-nowrap mr-3">
                        Đơn hàng chờ ({{ temporaryCarts.length }}):
                    </span>
                    <div class="flex gap-2">
                        <div v-for="tempCart in temporaryCarts" :key="tempCart.id || tempCart.cartId"
                            class="relative group flex-shrink-0">
                            <button @click="selectTemporaryCart(tempCart)" :class="[
                                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                                (currentCartId === (tempCart.id || tempCart.cartId))
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            ]">
                                <i class="fas fa-receipt text-xs"></i>
                                <div class="flex flex-col items-start">
                                    <span>#{{ tempCart.id || tempCart.cartId }}</span>
                                    <span v-if="tempCart.userId && tempCart.customerName" class="text-xs opacity-75">
                                        {{ tempCart.customerName }}
                                    </span>
                                </div>
                                <span v-if="tempCart.cartItems?.length > 0" class="px-1.5 py-0.5 rounded-full text-xs"
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

        <div class="flex flex-1 min-h-0 overflow-hidden">
            <!-- Left Panel - Product Selection -->
            <div class="flex-1 min-w-0 flex flex-col">
                <!-- Search - Fixed at top -->
                <div class="p-4 border-b bg-white flex-shrink-0">
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

                <!-- Product Grid - Scrollable -->
                <div class="flex-1 overflow-y-auto p-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div v-for="item in filteredItems" :key="item.id" @click="addToCart(item)" :class="[
                            'bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow relative'
                        ]">
                            <!-- Out of stock badge -->
                            <div v-if="!item.status || item.quantity <= 0"
                                class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-20">
                                <span class="font-bold">{{ !item.status ? 'Ngừng bán' : 'Hết hàng' }}</span>
                            </div>

                            <!-- Promotion badge -->
                            <div v-if="item.promotion && item.promotion.isActive"
                                class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full z-20">
                                {{ item.promotion.type === 'Percentage' ? '-' + item.promotion.discountAmount + '%' :
                                    '-' +
                                    formatCurrency(item.promotion.discountAmount) }}
                            </div>

                            <div
                                class="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                                <img v-if="item.image" :src="item.image" :alt="item.name"
                                    class="w-full h-full object-cover" />
                                <div v-else class="text-gray-400">
                                    <i class="fas fa-utensils text-3xl"></i>
                                </div>
                            </div>
                            <h3 class="font-medium text-gray-900 mb-1 text-sm line-clamp-2">{{ item.name }}</h3>
                            <p class="text-xs text-gray-600 mb-2 line-clamp-2">{{ item.description }}</p>
                            <div class="text-xs text-gray-500 mb-2">
                                Còn: {{ item.quantity }}
                            </div>
                            <div class="flex justify-between items-end">
                                <div class="flex flex-col">
                                    <!-- Original price (crossed out if there's promotion) -->
                                    <span v-if="item.promotion && item.promotion.isActive"
                                        class="text-xs text-gray-500 line-through">
                                        {{ formatCurrency(item.price) }}
                                    </span>
                                    <!-- Final price -->
                                    <span class="text-sm font-bold text-blue-600">
                                        {{ formatCurrency(getFinalPrice(item)) }}
                                    </span>
                                </div>
                                <button :disabled="!item.status || item.quantity <= 0" :class="[
                                    'p-2 rounded-lg transition-colors',
                                    (!item.status || item.quantity <= 0)
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                ]">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Load more or pagination if needed -->
                    <div v-if="loading" class="text-center py-4">
                        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </div>

            <!-- Right Panel - Cart & Checkout -->
            <div class="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
                <!-- Cart Header -->
                <div class="p-4 border-b border-gray-200 flex-shrink-0">
                    <div>
                        <h2 class="text-lg font-bold text-gray-800">Đơn hàng</h2>
                        <p v-if="totalItems > 0" class="text-sm text-gray-500">{{ totalItems }} phần</p>
                    </div>
                </div>

                <!-- Cart Items -->
                <div class="flex-1 overflow-y-auto p-4">
                    <div v-if="cartItems.length === 0" class="text-center text-gray-500 py-8">
                        <i class="fas fa-shopping-cart text-3xl mb-3 text-gray-300"></i>
                        <p class="text-sm">Chưa có món nào trong đơn hàng</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="item in cartItems" :key="item.id"
                            class="flex items-center bg-gray-50 rounded-lg p-3">
                            <div
                                class="w-10 h-10 bg-white rounded-lg mr-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img v-if="item.image" :src="item.image" :alt="item.name"
                                    class="w-full h-full object-cover" />
                                <i v-else class="fas fa-utensils text-gray-400 text-sm"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 text-sm truncate">{{ item.name }}</h4>
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
                            <div class="flex items-center space-x-1 flex-shrink-0">
                                <button @click="decreaseQuantity(item.id)" :disabled="item.quantity <= 1" :class="[
                                    'w-7 h-7 rounded-full flex items-center justify-center',
                                    item.quantity <= 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                ]">
                                    <i class="fas fa-minus text-xs"></i>
                                </button>
                                <span class="w-6 text-center font-medium text-sm">{{ item.quantity }}</span>
                                <button @click="increaseQuantity(item.id)"
                                    class="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center">
                                    <i class="fas fa-plus text-xs"></i>
                                </button>
                                <button @click="removeFromCart(item.id)"
                                    class="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center ml-1">
                                    <i class="fas fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary & Checkout -->
                <div v-if="cartItems.length > 0" class="border-t border-gray-200 p-4 flex-shrink-0">
                    <!-- Order Summary -->
                    <div class="space-y-1 mb-4">
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
                        <!-- Voucher discount -->
                        <div v-if="voucherDiscount > 0" class="flex justify-between text-sm text-green-600">
                            <span>Giảm giá voucher:</span>
                            <span>-{{ formatCurrency(voucherDiscount) }}</span>
                        </div>
                        <!-- Subtotal before voucher discount -->
                        <div v-if="voucherDiscount > 0" class="flex justify-between text-sm text-gray-600">
                            <span>Tạm tính:</span>
                            <span>{{ formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="border-t pt-2">
                            <div class="flex justify-between font-bold text-lg">
                                <span>Tổng cộng:</span>
                                <span class="text-blue-600">{{ formatCurrency(total) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Selection -->
                    <div class="mb-3">
                        <div v-if="currentSelectedCart?.userId || selectedCustomer?.id"
                            class="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <i class="fas fa-user-check text-green-600 mr-2"></i>
                                    <div class="font-medium text-green-800">
                                        {{ currentSelectedCart?.customerName || selectedCustomer?.name || 'Khách hàng'
                                        }}
                                    </div>
                                </div>
                                <button @click="showCustomerModal = true"
                                    class="text-green-600 hover:text-green-800 transition-colors">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        </div>
                        <div v-else class="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <i class="fas fa-user-times text-red-600 mr-2"></i>
                                    <div class="text-red-800 font-medium">Chưa chọn khách hàng</div>
                                </div>
                                <button @click="showCustomerModal = true"
                                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                                    Chọn
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Voucher Selection -->
                    <div class="mb-3">
                        <button @click="openVoucherModal"
                            class="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2.5 rounded-lg transition-colors border border-purple-300">
                            <i class="fas fa-ticket-alt mr-2"></i>
                            {{ selectedVoucher ? selectedVoucher.code : 'Chọn voucher' }}
                        </button>
                        <!-- Voucher validation warning -->
                        <div v-if="selectedVoucher && !isVoucherValid"
                            class="mt-1 text-xs text-red-600 flex items-center">
                            <i class="fas fa-exclamation-triangle mr-1"></i>
                            Đơn hàng chưa đủ {{ formatCurrency(selectedVoucher.minOrderPrice) }} để áp dụng voucher
                        </div>
                    </div>

                    <!-- Payment Method Selection -->
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button @click="paymentMethod = 0" :class="[
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                                paymentMethod === 0
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            ]">
                                <i class="fas fa-money-bill-wave mr-1"></i>
                                Tiền mặt
                            </button>
                            <button @click="paymentMethod = 1" :class="[
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                                paymentMethod === 1
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            ]">
                                <i class="fas fa-credit-card mr-1"></i>
                                VNPay
                            </button>
                        </div>
                    </div>

                    <!-- Customer Payment Input for Cash -->
                    <div v-if="paymentMethod === 0" class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Số tiền khách trả</label>
                        <input v-model="customerPaid" type="number" min="0" step="1000"
                            placeholder="Nhập số tiền khách trả..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        <div v-if="customerPaid && customerPaid >= total" class="mt-1 text-sm text-green-600">
                            <i class="fas fa-check-circle mr-1"></i>
                            Tiền thối: {{ formatCurrency(customerPaid - total) }}
                        </div>
                        <div v-else-if="customerPaid && customerPaid < total" class="mt-1 text-sm text-red-600">
                            <i class="fas fa-exclamation-circle mr-1"></i>
                            Thiếu: {{ formatCurrency(total - customerPaid) }}
                        </div>
                    </div>

                    <!-- Payment Button -->
                    <button @click="handleDirectPayment" :disabled="processing || !canProcessPayment" :class="[
                        'w-full font-bold py-3 rounded-lg transition-colors',
                        canProcessPayment && !processing
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                    ]">
                        <i v-if="processing" class="fas fa-spinner fa-spin mr-2"></i>
                        <i v-else class="fas fa-credit-card mr-2"></i>
                        <span v-if="processing">Đang xử lý...</span>
                        <span v-else>{{ paymentValidationMessage }}</span>
                    </button>
                </div>
            </div>
        </div>



        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            @click="handleCloseSuccessModal">
            <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4" @click.stop>
                <div class="text-center">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-2xl text-green-500"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h3>
                    <p class="text-gray-600 mb-4">
                        Đơn hàng đã được thanh toán thành công.
                    </p>
                    <div class="flex space-x-3">
                        <!-- <button @click="showReceiptModal = true"
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg">
                            In hóa đơn
                        </button> -->
                        <button @click="handleCloseSuccessModal"
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

        <!-- Customer Selection Modal -->
        <div v-if="showCustomerModal"
            class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
            @click="showCustomerModal = false">
            <div class="bg-white rounded-lg max-w-md w-full mx-4" @click.stop>
                <div class="p-6">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-gray-900">Chọn khách hàng</h3>
                        <button @click="showCustomerModal = false" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Customer Options -->
                    <div class="space-y-4">
                        <!-- Walk-in Customer -->
                        <button @click="selectWalkInCustomer"
                            class="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-walking text-blue-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900">Khách vãng lai</h4>
                                    <p class="text-sm text-gray-500">Khách hàng không cần thông tin</p>
                                </div>
                            </div>
                        </button>

                        <!-- Add New Customer -->
                        <button @click="showAddCustomerForm = true"
                            class="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-user-plus text-green-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900">Thêm khách hàng mới</h4>
                                    <p class="text-sm text-gray-500">Tạo thông tin khách hàng mới</p>
                                </div>
                            </div>
                        </button>

                        <!-- Search Existing Customer -->
                        <div class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center mb-3">
                                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-search text-orange-600"></i>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900">Tìm khách hàng</h4>
                                    <p class="text-sm text-gray-500">Tìm theo số điện thoại hoặc email</p>
                                </div>
                            </div>
                            <div class="relative">
                                <input v-model="customerSearchQuery" @input="searchCustomers" type="text"
                                    placeholder="Nhập số điện thoại hoặc email..."
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                <i v-if="!searchingCustomers"
                                    class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <i v-else
                                    class="fas fa-spinner fa-spin absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
                            </div>

                            <!-- Search Results -->
                            <div v-if="customerSearchResults.length > 0" class="mt-3 max-h-40 overflow-y-auto">
                                <div v-for="customer in customerSearchResults" :key="customer.id"
                                    @click="selectCustomer(customer)"
                                    class="p-3 hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 mb-2">
                                    <div class="font-medium text-gray-900">{{ customer.name }}</div>
                                    <div class="text-sm text-gray-500">
                                        {{ customer.phone }} • {{ customer.email }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="customerSearchQuery && customerSearchResults.length === 0 && !searchingCustomers"
                                class="mt-3 text-sm text-gray-500">
                                Không tìm thấy khách hàng nào
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Customer Form -->
                <div v-if="showAddCustomerForm" class="border-t p-6">
                    <h4 class="font-medium text-gray-900 mb-4">Thông tin khách hàng mới</h4>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                            <input v-model="newCustomer.fullName" type="text"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập họ tên đầy đủ" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                            <input v-model="newCustomer.phoneNumber" type="tel"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập số điện thoại" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input v-model="newCustomer.email" type="email"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập địa chỉ email" />
                        </div>
                        <div class="flex gap-3">
                            <button @click="createNewCustomer"
                                :disabled="!newCustomer.fullName || !newCustomer.phoneNumber || !newCustomer.email"
                                class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-lg">
                                Thêm khách hàng
                            </button>
                            <button @click="showAddCustomerForm = false"
                                class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Voucher Selection Modal -->
        <div v-if="showVoucherModal" class="fixed inset-0 bg-white bg-opacity-20 flex items-center justify-center z-50"
            @click="showVoucherModal = false">
            <div class="bg-white rounded-lg max-w-md w-full mx-4 shadow-lg" @click.stop>
                <div class="p-6">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-bold text-gray-900">Chọn voucher</h3>
                        <button @click="showVoucherModal = false" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- No Voucher Option -->
                    <button @click="selectVoucher(null)"
                        class="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors mb-3">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <i class="fas fa-times text-gray-600"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-900">Không sử dụng voucher</h4>
                                <p class="text-sm text-gray-500">Bỏ qua giảm giá</p>
                            </div>
                        </div>
                    </button>

                    <!-- Available Vouchers -->
                    <div class="space-y-3 max-h-60 overflow-y-auto">
                        <!-- Loading State -->
                        <div v-if="loadingVouchers" class="flex items-center justify-center py-4">
                            <i class="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                            <span class="text-gray-500">Đang tải voucher...</span>
                        </div>

                        <!-- No Vouchers -->
                        <div v-else-if="!availableVouchers || availableVouchers.length === 0" class="text-center py-4">
                            <i class="fas fa-ticket-alt text-gray-400 text-2xl mb-2"></i>
                            <p class="text-gray-500">Không có voucher phù hợp</p>
                        </div>

                        <!-- Voucher List -->
                        <button v-else v-for="voucher in availableVouchers" :key="voucher.voucherId"
                            @click="selectVoucher(voucher)"
                            class="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" :class="{
                                    'bg-purple-100': voucher.type === 'Percentage',
                                    'bg-green-100': voucher.type === 'Amount'
                                }">
                                    <i :class="{
                                        'fas fa-percent text-purple-600': voucher.type === 'Percentage',
                                        'fas fa-money-bill-wave text-green-600': voucher.type === 'Amount'
                                    }"></i>
                                </div>
                                <div class="flex-1">
                                    <h4 class="font-medium text-gray-900">{{ voucher.code }}</h4>
                                    <p class="text-sm text-gray-500">
                                        {{ voucher.type === 'Percentage'
                                            ? `Giảm ${voucher.discountAmount}% tối đa
                                        ${formatCurrency(voucher.maxDiscountPrice || 0)}`
                                            : `Giảm ${formatCurrency(voucher.discountAmount)}`
                                        }}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        Đơn tối thiểu: {{ formatCurrency(voucher.minOrderPrice || 0) }}
                                    </p>
                                    <p class="text-xs text-blue-600">
                                        Còn lại: {{ voucher.quantity }} voucher
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Notifications -->
        <div class="fixed top-4 right-4 z-50 space-y-2">
            <div v-for="toast in toasts" :key="toast.id"
                class="flex items-center p-4 mb-4 text-sm rounded-lg shadow-lg transition-all duration-300 ease-in-out transform"
                :class="{
                    'text-green-800 bg-green-50 border border-green-200': toast.type === 'success',
                    'text-red-800 bg-red-50 border border-red-200': toast.type === 'error',
                    'text-blue-800 bg-blue-50 border border-blue-200': toast.type === 'info',
                    'text-yellow-800 bg-yellow-50 border border-yellow-200': toast.type === 'warning'
                }">
                <i :class="{
                    'fas fa-check-circle text-green-500': toast.type === 'success',
                    'fas fa-times-circle text-red-500': toast.type === 'error',
                    'fas fa-info-circle text-blue-500': toast.type === 'info',
                    'fas fa-exclamation-triangle text-yellow-500': toast.type === 'warning'
                }" class="mr-3"></i>
                <span class="font-medium">{{ toast.message }}</span>
                <button @click="removeToast(toast.id)" class="ml-auto text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatCurrency } from '@/utils/format'
import { useFoodStore } from '@/stores/foodStore'
import { useComboStore } from '@/stores/comboStore'
import { useOrderStore } from '@/stores/orderStore'
import { useCartStore } from '@/stores/cartStore'
import { useCustomerStore } from '@/stores/userStore'
import { useCustomerManagementStore } from '@/stores/customerStore'
import { useVoucherStore } from '@/stores/voucherStore'
import { getVouchers } from '@/services/voucherService'
import ReceiptModal from '@/components/ReceiptModal.vue'

const router = useRouter()
const route = useRoute()
const foodStore = useFoodStore()
const comboStore = useComboStore()
const orderStore = useOrderStore()
const cartStore = useCartStore()
const customerStore = useCustomerStore()
const customerManagementStore = useCustomerManagementStore()
const voucherStore = useVoucherStore()

// Data
const loading = ref(false)
const processing = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const cartItems = ref([])
const customerName = ref('')
const paymentMethod = ref(0) // 0 = Cash, 1 = VNPay
const customerPaid = ref(0) // Số tiền khách trả
const showSuccessModal = ref(false)
const showReceiptModal = ref(false)
const showCustomerModal = ref(false)
const showAddCustomerForm = ref(false)
const showVoucherModal = ref(false)
const selectedVoucher = ref(null)
const loadingVouchers = ref(false)
const availableVouchers = ref([]) // Local voucher list for POS only
const lastOrderId = ref('')
const lastCompletedOrder = ref(null)
const currentCartId = ref(null)
const currentSelectedCart = ref(null) // Lưu trữ thông tin đầy đủ về đơn hàng đang được chọn
const creatingTemp = ref(false)
const loadingTempCarts = ref(false)
const temporaryCarts = computed(() => cartStore.temporaryCarts)

// Customer related data
const selectedCustomer = ref(null)
const customerSearchQuery = ref('')
const customerSearchResults = ref([])
const searchingCustomers = ref(false)
const newCustomer = ref({
    fullName: '',
    phoneNumber: '',
    email: ''
})

// Toast notifications
const toasts = ref([])
let toastIdCounter = 0

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

// Voucher validation
const isVoucherValid = computed(() => {
    if (!selectedVoucher.value) return true
    return subtotal.value >= (selectedVoucher.value.minOrderPrice || 0)
})

// Voucher discount calculation
const voucherDiscount = computed(() => {
    if (!selectedVoucher.value || !isVoucherValid.value) return 0

    const voucher = selectedVoucher.value
    const orderTotal = subtotal.value

    let discount = 0
    if (voucher.type === 'Percentage') {
        discount = orderTotal * (voucher.discountAmount / 100)
        // Apply max discount limit if exists
        if (voucher.maxDiscountPrice && discount > voucher.maxDiscountPrice) {
            discount = voucher.maxDiscountPrice
        }
    } else if (voucher.type === 'Amount') {
        discount = voucher.discountAmount
    }

    // Discount cannot exceed order total
    return Math.min(discount, orderTotal)
})

const total = computed(() => {
    return Math.max(0, subtotal.value - voucherDiscount.value)
})

const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const canProcessPayment = computed(() => {
    // Nếu không có sản phẩm trong giỏ hàng
    if (cartItems.value.length === 0) return false

    // Kiểm tra phải có thông tin khách hàng (userId từ đơn hàng đang chọn hoặc selectedCustomer)
    const hasCustomerInfo = currentSelectedCart.value?.userId || selectedCustomer.value?.id
    if (!hasCustomerInfo) return false

    // Nếu chọn VNPay (1), có thể thanh toán
    if (paymentMethod.value === 1) return true

    // Nếu chọn tiền mặt (0), phải nhập số tiền khách trả và phải >= tổng tiền
    if (paymentMethod.value === 0) {
        return customerPaid.value && customerPaid.value >= total.value
    }

    return false
})

const paymentValidationMessage = computed(() => {
    if (cartItems.value.length === 0) {
        return 'Giỏ hàng trống'
    }

    // Kiểm tra thông tin khách hàng
    const hasCustomerInfo = currentSelectedCart.value?.userId || selectedCustomer.value?.id
    if (!hasCustomerInfo) {
        return 'Vui lòng chọn khách hàng'
    }

    // Kiểm tra phương thức thanh toán tiền mặt
    if (paymentMethod.value === 0) {
        if (!customerPaid.value) {
            return 'Nhập số tiền khách trả'
        }
        if (customerPaid.value < total.value) {
            return 'Số tiền không đủ'
        }
    }

    return 'Thanh toán'
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

// Payment method helper functions
const getPaymentMethodText = (method) => {
    switch (method) {
        case 0:
            return 'Tiền mặt'
        case 1:
            return 'VNPay'
        default:
            return 'Tiền mặt'
    }
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

// Toast notification functions
const showToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastIdCounter
    const toast = { id, message, type }
    toasts.value.push(toast)

    // Auto remove toast after duration
    setTimeout(() => {
        removeToast(id)
    }, duration)
}

const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
        toasts.value.splice(index, 1)
    }
}

const showSuccessToast = (message) => showToast(message, 'success')
const showErrorToast = (message) => showToast(message, 'error')
const showInfoToast = (message) => showToast(message, 'info')
const showWarningToast = (message) => showToast(message, 'warning')

// Handle closing success modal and reload data
const handleCloseSuccessModal = async () => {
    showSuccessModal.value = false
    // Reload food and combo data to get latest quantities
    await performSearch('')
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
        showWarningToast('Vui lòng tạo đơn mới hoặc chọn đơn có sẵn trước khi thêm sản phẩm')
        return
    }

    // Check if item is available
    if (!item.status) {
        showWarningToast('Sản phẩm này đã ngừng bán')
        return
    }

    if (item.quantity <= 0) {
        showWarningToast('Sản phẩm này đã hết hàng')
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

        // Handle API error response
        if (error.response && error.response.data) {
            const errorData = error.response.data
            if (!errorData.success && errorData.message) {
                showWarningToast(errorData.message)
                // Sync cart to get updated quantities from backend
                await syncCartFromBackend()
                return
            }
        }

        showErrorToast('Có lỗi khi thêm sản phẩm vào giỏ hàng')
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
        showErrorToast('Có lỗi khi xóa sản phẩm khỏi giỏ hàng')
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

        // Handle API error response
        if (error.response && error.response.data) {
            const errorData = error.response.data
            if (!errorData.success && errorData.message) {
                showWarningToast(errorData.message)
                // Sync cart to get updated quantities from backend
                await syncCartFromBackend()
                return
            }
        }

        showErrorToast('Có lỗi khi cập nhật số lượng')
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

        // Handle API error response
        if (error.response && error.response.data) {
            const errorData = error.response.data
            if (!errorData.success && errorData.message) {
                showWarningToast(errorData.message)
                // Sync cart to get updated quantities from backend
                await syncCartFromBackend()
                return
            }
        }

        showErrorToast('Có lỗi khi cập nhật số lượng')
    }
}

const clearCart = () => {
    cartItems.value = []
    customerName.value = ''
    customerPaid.value = 0 // Reset số tiền khách trả
    currentSelectedCart.value = null // Xóa thông tin đôn hàng đang được chọn
    // Keep selectedCustomer so the name stays on the button
    // selectedCustomer.value = null
    selectedVoucher.value = null
    showSuccessModal.value = false
    showReceiptModal.value = false
    showCustomerModal.value = false
    showAddCustomerForm.value = false
    showVoucherModal.value = false
}

const loadTemporaryCarts = async () => {
    loadingTempCarts.value = true
    try {
        await cartStore.fetchTemporaryCarts()

        // Load customer names for carts that have userId
        for (const cart of cartStore.temporaryCarts) {
            if (cart.userId && !cart.customerName) {
                try {
                    // Get customer info by userId
                    await customerStore.fetchCustomers({
                        pageSize: 1000 // Get all customers to find by ID
                    })

                    const customer = customerStore.customers.find(c => c.id === cart.userId)
                    if (customer) {
                        // Add customer name to cart object
                        cart.customerName = customer.fullName
                    }
                } catch (customerError) {
                    console.error(`Error loading customer for cart ${cart.cartId}:`, customerError)
                }
            }
        }
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
        currentSelectedCart.value = tempCart // Lưu trữ thông tin đầy đủ về đơn hàng đang được chọn

        // Reset selectedCustomer when switching carts - let currentSelectedCart handle customer info
        selectedCustomer.value = null

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
        currentSelectedCart.value = null // Xóa thông tin đơn hàng đang được chọn
        // Start fresh for the new temporary order
        cartItems.value = []
        customerName.value = ''
        customerPaid.value = 0 // Reset số tiền khách trả
        paymentMethod.value = 0 // Default to cash
        selectedCustomer.value = null // Reset selected customer for new cart

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
            currentSelectedCart.value = null // Xóa thông tin đơn hàng đang được chọn
            cartItems.value = []
            customerName.value = ''
            customerPaid.value = 0 // Reset số tiền khách trả
            paymentMethod.value = 0 // Default to cash
            selectedCustomer.value = null // Reset selected customer when deleting current cart
        }

        // Show success message
        showSuccessToast('Đã xóa đơn hàng thành công!')

    } catch (error) {
        console.error('Error deleting temporary cart:', error)
        showErrorToast('Không thể xóa đơn hàng. Vui lòng thử lại.')
    }
}

const handleDirectPayment = async () => {
    // Kiểm tra giỏ hàng trống
    if (cartItems.value.length === 0) {
        showErrorToast('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.')
        return
    }

    if (!currentCartId.value) {
        showErrorToast('Không tìm thấy ID giỏ hàng. Vui lòng thử lại.')
        return
    }

    // Kiểm tra thông tin khách hàng
    const hasCustomerInfo = currentSelectedCart.value?.userId || selectedCustomer.value?.id
    if (!hasCustomerInfo) {
        showErrorToast('Vui lòng chọn khách hàng trước khi thanh toán.')
        return
    }

    // Validate payment for cash method
    if (paymentMethod.value === 0) {
        if (!customerPaid.value) {
            showErrorToast('Vui lòng nhập số tiền khách trả.')
            return
        }
        if (customerPaid.value < total.value) {
            showErrorToast('Số tiền khách trả không đủ để thanh toán.')
            return
        }
    }

    // Create payment data with current values
    const paymentData = {
        customerName: currentSelectedCart.value?.customerName || selectedCustomer.value?.name || customerName.value || 'Khách hàng tại quầy',
        paymentMethod: paymentMethod.value,
        customerPaid: paymentMethod.value === 0 ? customerPaid.value : total.value, // Sử dụng số tiền khách trả cho tiền mặt
        change: paymentMethod.value === 0 ? (customerPaid.value - total.value) : 0 // Tính tiền thối cho tiền mặt
    }

    // Call the existing payment confirm function
    await handlePaymentConfirm(paymentData)
}

const handlePaymentConfirm = async (paymentData) => {
    if (cartItems.value.length === 0) return

    if (!currentCartId.value) {
        showErrorToast('Không tìm thấy ID giỏ hàng. Vui lòng thử lại.')
        return
    }

    processing.value = true
    try {
        // Update customer info and payment method from modal
        customerName.value = paymentData.customerName
        paymentMethod.value = paymentData.paymentMethod

        // Prepare order data according to CreateOrderDto
        const orderData = {
            cartId: currentCartId.value,
            userId: currentSelectedCart.value?.userId || selectedCustomer.value?.id || null,
            paymentMethod: paymentData.paymentMethod, // 0 = Cash, 1 = VNPay
            voucherId: selectedVoucher.value?.voucherId || null
        }

        // Store additional data for local use (receipt, etc.)
        const localOrderData = {
            customerName: currentSelectedCart.value?.customerName || selectedCustomer.value?.name || paymentData.customerName || 'Khách hàng tại quầy',
            paymentMethod: paymentData.paymentMethod,
            customerPaid: paymentData.customerPaid,
            change: paymentData.change,
            customer: currentSelectedCart.value?.userId ? { id: currentSelectedCart.value.userId, name: currentSelectedCart.value.customerName } : selectedCustomer.value,
            voucher: selectedVoucher.value,
            voucherDiscount: voucherDiscount.value,
            items: cartItems.value.map(item => ({
                id: item.id,
                name: item.name,
                price: item.finalPrice || item.price,
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
                ...localOrderData,
                id: lastOrderId.value,
                createdAt: new Date()
            }

            // Handle different payment methods
            if (paymentData.paymentMethod === 1 && result.paymentUrl) {
                // VNPay payment - redirect to VNPay, the response will be handled by checkout-success/checkout-failed pages
                window.location.href = result.paymentUrl
                showInfoToast('Đang chuyển hướng đến VNPay...')
                // Don't clear cart or show success modal for VNPay, let the callback pages handle it
            } else {
                // Cash payment - show success notification and modal
                clearCart()
                // Load lại danh sách hóa đơn chờ sau khi thanh toán thành công
                await loadTemporaryCarts()
                // Reload food data to get latest quantities after payment
                await performSearch('')
                showSuccessModal.value = true
                showSuccessToast('Thanh toán thành công!')
            }
        } else {
            // Handle API error response when order creation fails
            if (result.message) {
                showErrorToast(result.message)
                // Sync cart to get updated quantities from backend if needed
                await syncCartFromBackend()
                return
            }
            throw new Error('Tạo đơn hàng thất bại')
        }
    } catch (error) {
        console.error('Error processing order:', error)

        // Handle API error response
        if (error.response && error.response.data) {
            const errorData = error.response.data
            if (!errorData.success && errorData.message) {
                showErrorToast(errorData.message)
                // Sync cart to get updated quantities from backend
                await syncCartFromBackend()
                return
            }
        }

        showErrorToast(error.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.')
    } finally {
        processing.value = false
    }
}

const saveOrder = async () => {
    if (cartItems.value.length === 0) return

    if (!currentCartId.value) {
        showErrorToast('Không tìm thấy ID giỏ hàng. Vui lòng thử lại.')
        return
    }

    try {
        // Prepare order data according to CreateOrderDto
        const orderData = {
            cartId: currentCartId.value,
            userId: selectedCustomer.value?.id || null,
            paymentMethod: paymentMethod.value, // 0 = Cash, 1 = VNPay
            voucherId: selectedVoucher.value?.voucherId || null
        }

        const result = await orderStore.submitOrder(orderData)
        if (result.success) {
            clearCart()
            showSuccessToast('Đơn hàng đã được lưu thành công!')
        } else {
            throw new Error(result.message || 'Lưu đơn hàng thất bại')
        }
    } catch (error) {
        console.error('Error saving order:', error)
        showErrorToast('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.')
    }
}

// Voucher related methods
const loadVouchers = async () => {
    loadingVouchers.value = true
    try {
        // Call API directly to avoid affecting shared voucherStore state
        const today = new Date().toISOString().split('T')[0] // yyyy-MM-dd format
        const params = {
            page: 1,
            pageSize: 100, // Get enough vouchers for POS
            isActive: true,
            minOrderAmount: subtotal.value || 0,
            isOutOfStock: false,
            startDateTo: today, // Voucher must have started by today (startDate <= today)
            endDateFrom: today  // Voucher must still be valid (endDate >= today)
        }

        const response = await getVouchers(params)
        // Store vouchers in local state to avoid affecting shared voucherStore
        availableVouchers.value = response.data.items || []
    } catch (error) {
        console.error('Error loading vouchers:', error)
        showErrorToast('Không thể tải danh sách voucher')
    } finally {
        loadingVouchers.value = false
    }
}

const openVoucherModal = async () => {
    showVoucherModal.value = true
    await loadVouchers()
}

const selectVoucher = (voucher) => {
    selectedVoucher.value = voucher
    showVoucherModal.value = false
    if (voucher) {
        showSuccessToast(`Đã chọn voucher: ${voucher.code}`)
        // Show discount amount info
        if (voucher.type === 'Percentage') {
            showInfoToast(`Giảm ${voucher.discountAmount}% (tối đa ${formatCurrency(voucher.maxDiscountPrice || 0)})`)
        } else {
            showInfoToast(`Giảm ${formatCurrency(voucher.discountAmount)}`)
        }
    } else {
        showInfoToast('Đã bỏ chọn voucher')
    }
}

// Customer related methods
const selectWalkInCustomer = async () => {
    try {
        searchingCustomers.value = true

        // Call API to get walk-in customer by email using customerStore
        await customerStore.fetchCustomers({
            email: 'customer@example.com',
            pageSize: 1
        })

        if (customerStore.customers && customerStore.customers.length > 0) {
            // Use the first customer found with the email and map fields correctly
            const customer = customerStore.customers[0]
            selectedCustomer.value = {
                id: customer.id,
                name: customer.fullName,
                phone: customer.phoneNumber,
                email: customer.email,
                userName: customer.userName,
                emailConfirmed: customer.emailConfirmed,
                phoneNumberConfirmed: customer.phoneNumberConfirmed
            }

            // Assign cart to the walk-in customer if there's a current cart
            if (currentCartId.value && customer.id) {
                try {
                    const result = await cartStore.assignCartToUser(currentCartId.value, customer.id)
                    console.log('Successfully assigned cart to walk-in customer')
                    if (result && result.message) {
                        showSuccessToast(result.message)
                    } else {
                        showSuccessToast('Đã gán giỏ hàng cho khách vãng lai')
                    }

                    // Reload temporary carts to get updated data
                    await loadTemporaryCarts()

                    // Update currentSelectedCart with the latest data
                    if (currentCartId.value) {
                        const updatedCart = cartStore.temporaryCarts.find(cart =>
                            (cart.id || cart.cartId) === currentCartId.value
                        )
                        if (updatedCart) {
                            currentSelectedCart.value = updatedCart
                        }
                    }
                } catch (assignError) {
                    console.error('Error assigning cart to walk-in customer:', assignError)
                    // Show error message from API response
                    const errorMessage = assignError.response?.data?.message || 'Không thể gán giỏ hàng cho khách hàng. Vui lòng thử lại.'
                    showErrorToast(errorMessage)
                    // Don't throw error here, customer selection should still work
                }
            }
        } else {
            // Fallback to default walk-in customer if no customer found
            selectedCustomer.value = {
                id: 'walk-in',
                name: 'Khách vãng lai',
                phone: '',
                email: 'customer@example.com'
            }
        }
    } catch (error) {
        console.error('Error fetching walk-in customer:', error)
        // Fallback to default walk-in customer on error
        selectedCustomer.value = {
            id: 'walk-in',
            name: 'Khách vãng lai',
            phone: '',
            email: 'customer@example.com'
        }
    } finally {
        searchingCustomers.value = false
        showCustomerModal.value = false
        showAddCustomerForm.value = false
    }
}

const selectCustomer = async (customer) => {
    try {
        selectedCustomer.value = customer

        // Assign cart to the selected customer if there's a current cart
        if (currentCartId.value && customer.id) {
            try {
                const result = await cartStore.assignCartToUser(currentCartId.value, customer.id)
                console.log('Successfully assigned cart to selected customer:', customer.name)
                if (result && result.message) {
                    showSuccessToast(result.message)
                } else {
                    showSuccessToast(`Đã gán giỏ hàng cho khách hàng ${customer.name}`)
                }

                // Reload temporary carts to get updated data with customer info
                await loadTemporaryCarts()

                // Update currentSelectedCart with the latest data
                if (currentCartId.value) {
                    const updatedCart = cartStore.temporaryCarts.find(cart =>
                        (cart.id || cart.cartId) === currentCartId.value
                    )
                    if (updatedCart) {
                        currentSelectedCart.value = updatedCart
                    }
                }
            } catch (assignError) {
                console.error('Error assigning cart to customer:', assignError)
                // Show error message from API response
                const errorMessage = assignError.response?.data?.message || 'Không thể gán giỏ hàng cho khách hàng. Vui lòng thử lại.'
                showErrorToast(errorMessage)
                // Don't throw error here, customer selection should still work
            }
        }

        showCustomerModal.value = false
        customerSearchQuery.value = ''
        customerSearchResults.value = []
    } catch (error) {
        console.error('Error selecting customer:', error)
    }
}

let customerSearchTimeout = null
const searchCustomers = async () => {
    const query = customerSearchQuery.value.trim()

    if (!query) {
        customerSearchResults.value = []
        return
    }

    if (customerSearchTimeout) {
        clearTimeout(customerSearchTimeout)
    }

    customerSearchTimeout = setTimeout(async () => {
        searchingCustomers.value = true
        try {
            // Call API to search customers using customerStore
            await customerStore.fetchCustomers({
                searchTerm: query, // Search by name, email, or phone
                pageSize: 10 // Limit results for better performance
            })

            // Map the customers to match the expected format
            customerSearchResults.value = customerStore.customers.map(customer => ({
                id: customer.id,
                name: customer.fullName,
                phone: customer.phoneNumber,
                email: customer.email,
                userName: customer.userName,
                emailConfirmed: customer.emailConfirmed,
                phoneNumberConfirmed: customer.phoneNumberConfirmed
            }))
        } catch (error) {
            console.error('Error searching customers:', error)
            customerSearchResults.value = []
        } finally {
            searchingCustomers.value = false
        }
    }, 300)
}

const createNewCustomer = async () => {
    if (!newCustomer.value.fullName || !newCustomer.value.phoneNumber) {
        showWarningToast('Vui lòng nhập họ tên và số điện thoại')
        return
    }

    if (!newCustomer.value.email) {
        showWarningToast('Vui lòng nhập email')
        return
    }

    try {
        // Call API to create customer using customerManagementStore
        const response = await customerManagementStore.createCustomer({
            fullName: newCustomer.value.fullName,
            phoneNumber: newCustomer.value.phoneNumber,
            email: newCustomer.value.email
        })

        if (response.data) {
            // Map the created customer to match the expected format
            const createdCustomer = {
                id: response.data.id,
                name: response.data.fullName,
                phone: response.data.phoneNumber,
                email: response.data.email,
                userName: response.data.userName,
                emailConfirmed: response.data.emailConfirmed,
                phoneNumberConfirmed: response.data.phoneNumberConfirmed
            }

            selectedCustomer.value = createdCustomer

            // Assign cart to the new customer if there's a current cart
            if (currentCartId.value && createdCustomer.id) {
                try {
                    const result = await cartStore.assignCartToUser(currentCartId.value, createdCustomer.id)
                    console.log('Successfully assigned cart to new customer:', createdCustomer.name)
                    if (result && result.message) {
                        showSuccessToast(result.message)
                    }

                    // Reload temporary carts to get updated data
                    await loadTemporaryCarts()

                    // Update currentSelectedCart with the latest data
                    if (currentCartId.value) {
                        const updatedCart = cartStore.temporaryCarts.find(cart =>
                            (cart.id || cart.cartId) === currentCartId.value
                        )
                        if (updatedCart) {
                            currentSelectedCart.value = updatedCart
                        }
                    }
                } catch (assignError) {
                    console.error('Error assigning cart to new customer:', assignError)
                    const errorMessage = assignError.response?.data?.message || 'Không thể gán giỏ hàng cho khách hàng mới'
                    showErrorToast(errorMessage)
                }
            }

            showCustomerModal.value = false
            showAddCustomerForm.value = false

            // Reset form
            newCustomer.value = {
                fullName: '',
                phoneNumber: '',
                email: ''
            }

            showSuccessToast('Đã thêm khách hàng thành công!')
        }
    } catch (error) {
        console.error('Error creating customer:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi khi tạo khách hàng. Vui lòng thử lại.'
        showErrorToast(errorMessage)
    }
}

// Watchers
watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery)
})

// Watch subtotal changes to validate voucher
watch(subtotal, (newSubtotal) => {
    if (selectedVoucher.value && newSubtotal < (selectedVoucher.value.minOrderPrice || 0)) {
        showWarningToast(`Voucher yêu cầu đơn hàng tối thiểu ${formatCurrency(selectedVoucher.value.minOrderPrice)}`)
    }
})

// Watch payment method changes to reset customerPaid when switching to VNPay
watch(paymentMethod, (newMethod) => {
    if (newMethod === 1) { // VNPay selected
        customerPaid.value = 0 // Reset customer paid amount for VNPay
    }
})

// Lifecycle
onMounted(async () => {
    await loadData()

    // Kiểm tra nếu có tham số reload=true từ checkout pages
    if (route.query.reload === 'true') {
        await loadTemporaryCarts()
        showSuccessToast('Danh sách hóa đơn chờ đã được cập nhật!')

        // Xóa query parameter khỏi URL để tránh reload lại khi user refresh
        router.replace({ path: '/pos' })
    }

    // Kiểm tra nếu có tham số retry=true (từ failed payment)
    if (route.query.retry === 'true') {
        showInfoToast('Vui lòng thử lại thanh toán!')
    }
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
    height: 100vh;
    /* Full viewport height */
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
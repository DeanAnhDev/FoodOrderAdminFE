<template>
    <div class="bill-management">
        <div class="header">
            <h2>Quản lý đơn hàng</h2>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-section">
            <div class="search-controls">
                <div class="search-row">
                    <div class="search-box">
                        <input v-model="searchQuery.orderCode" type="text" placeholder="Tìm kiếm theo mã đơn hàng..."
                            class="search-input" @keyup.enter="handleSearch" />
                        <button @click="handleSearch" class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>

                    <button @click="clearFilters" class="clear-btn">
                        <i class="fas fa-times"></i>
                        Xóa bộ lọc
                    </button>
                </div>

                <div class="filter-controls">
                    <div class="status-filter-section">
                        <h5>Lọc theo trạng thái:</h5>
                        <div class="status-filter-buttons">
                            <button @click="filterByStatus('')"
                                :class="['filter-btn', { 'active': searchQuery.status === '' }]">
                                Tất cả
                            </button>
                            <button @click="filterByStatus('0')"
                                :class="['filter-btn', 'status-pending', { 'active': searchQuery.status === '0' }]">
                                Chờ xử lý
                            </button>
                            <button @click="filterByStatus('1')"
                                :class="['filter-btn', 'status-accepted', { 'active': searchQuery.status === '1' }]">
                                Đã xác nhận
                            </button>
                            <button @click="filterByStatus('2')"
                                :class="['filter-btn', 'status-processing', { 'active': searchQuery.status === '2' }]">
                                Đang xử lý
                            </button>
                            <button @click="filterByStatus('3')"
                                :class="['filter-btn', 'status-done', { 'active': searchQuery.status === '3' }]">
                                Đã làm xong
                            </button>
                            <button @click="filterByStatus('4')"
                                :class="['filter-btn', 'status-shipping', { 'active': searchQuery.status === '4' }]">
                                Đang giao hàng
                            </button>
                            <button @click="filterByStatus('5')"
                                :class="['filter-btn', 'status-completed', { 'active': searchQuery.status === '5' }]">
                                Hoàn thành
                            </button>
                            <button @click="filterByStatus('6')"
                                :class="['filter-btn', 'status-cancelled', { 'active': searchQuery.status === '6' }]">
                                Đã hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="orderStore.loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>

        <!-- Error State -->
        <div v-if="orderStore.error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ orderStore.error }}
        </div>

        <!-- Orders List -->
        <div v-if="!orderStore.loading && !orderStore.error" class="orders-container">
            <div v-if="orderStore.orders.length === 0" class="no-data">
                <i class="fas fa-inbox"></i>
                <h3>Không có đơn hàng nào</h3>
                <p>Không tìm thấy đơn hàng nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>

            <div v-else class="orders-grid">
                <div v-for="order in orderStore.orders" :key="order.orderId" class="order-card"
                    @click="viewOrderDetails(order)">
                    <div class="order-header">
                        <div class="order-code">
                            <strong>#{{ order.orderCode }}</strong>
                        </div>
                        <div class="order-date">
                            {{ formatDate(order.createdAt) }}
                        </div>
                    </div>

                    <div class="order-info">
                        <div class="customer-info">
                            <i class="fas fa-user"></i>
                            <span>{{ getCustomerName(order.userId) }}</span>
                        </div>
                        <div class="phone-info">
                            <i class="fas fa-sticky-note"></i>
                            <span>{{ order.note || 'Không có ghi chú' }}</span>
                        </div>
                        <div class="address-info">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>{{ order.address || 'Chưa có địa chỉ' }}</span>
                        </div>
                    </div>

                    <div class="order-status">
                        <span :class="['status-badge', getStatusClass(order.status)]">
                            {{ getStatusText(order.status) }}
                        </span>
                        <span :class="['payment-badge', getPaymentStatusClass(order.paymentStatus)]">
                            {{ getPaymentStatusText(order.paymentStatus) }}
                        </span>
                    </div>

                    <div class="order-summary">
                        <div class="summary-content">
                            <div class="total-amount-1">{{ formatCurrency(order.totalAmount) }}</div>
                            <div class="items-count">{{ order.orderDetails?.length || 0 }} món</div>
                        </div>
                    </div>

                    <div class="order-actions">
                        <button class="btn btn-info btn-sm" @click.stop="viewOrderDetails(order)">
                            <i class="fas fa-eye"></i>
                            Chi tiết
                        </button>

                        <!-- Chờ xử lý (status = 0) -->
                        <template v-if="order.status === 0">
                            <button class="btn btn-success btn-sm" @click.stop="quickUpdateStatus(order, 1)">
                                <i class="fas fa-check"></i>
                                Xác nhận đơn hàng
                            </button>
                            <button class="btn btn-danger btn-sm" @click.stop="showCancelModal(order)">
                                <i class="fas fa-times"></i>
                                Hủy đơn hàng
                            </button>
                        </template>

                        <!-- Đã xác nhận (status = 1) -->
                        <template v-if="order.status === 1">
                            <button class="btn btn-warning btn-sm" @click.stop="quickUpdateStatus(order, 2)">
                                <i class="fas fa-clock"></i>
                                Bắt đầu xử lý
                            </button>
                        </template>

                        <!-- Đang xử lý (status = 2) -->
                        <template v-if="order.status === 2">
                            <button class="btn btn-primary btn-sm" @click.stop="quickUpdateStatus(order, 3)">
                                <i class="fas fa-check-double"></i>
                                Hoàn thành xử lý
                            </button>
                        </template>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button @click="goToPage(currentPage - 1)" :disabled="!orderStore.hasPreviousPage"
                    class="pagination-btn">
                    <i class="fas fa-chevron-left"></i>
                </button>

                <span class="pagination-info">
                    Trang {{ currentPage }} / {{ totalPages }}
                    ({{ orderStore.total }} đơn hàng)
                </span>

                <button @click="goToPage(currentPage + 1)" :disabled="!orderStore.hasNextPage" class="pagination-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal-content order-details-modal" @click.stop>
                <div class="modal-header">
                    <div class="header-info">
                        <h3>Chi tiết đơn hàng</h3>
                        <span class="order-code">#{{ selectedOrder?.orderCode }}</span>
                    </div>
                    <button @click="closeDetailsModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body" v-if="selectedOrder">
                    <div class="order-details-container">
                        <!-- Status and Basic Info Card -->
                        <div class="info-card">
                            <div class="card-header">
                                <i class="fas fa-info-circle"></i>
                                <h4>Thông tin cơ bản</h4>
                            </div>
                            <div class="card-content">
                                <div class="status-row">
                                    <div class="status-item">
                                        <span class="label">Trạng thái đơn hàng:</span>
                                        <span :class="['status-badge', getStatusClass(selectedOrder.status)]">
                                            <i class="fas fa-circle"></i>
                                            {{ getStatusText(selectedOrder.status) }}
                                        </span>
                                    </div>
                                    <div class="status-item">
                                        <span class="label">Thanh toán:</span>
                                        <span
                                            :class="['payment-badge', getPaymentStatusClass(selectedOrder.paymentStatus)]">
                                            <i class="fas fa-credit-card"></i>
                                            {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
                                        </span>
                                    </div>
                                </div>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <i class="fas fa-calendar-alt"></i>
                                        <div>
                                            <span class="label">Ngày đặt</span>
                                            <span class="value">{{ formatDate(selectedOrder.createdAt) }}</span>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <div>
                                            <span class="label">Phương thức thanh toán</span>
                                            <span class="value">{{ getPaymentMethodText(selectedOrder.paymentMethod)
                                                }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Info Card -->
                        <div class="info-card">
                            <div class="card-header">
                                <i class="fas fa-user"></i>
                                <h4>Thông tin khách hàng</h4>
                            </div>
                            <div class="card-content">
                                <div v-if="loadingCustomer" class="loading-state">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    <span>Đang tải thông tin khách hàng...</span>
                                </div>
                                <div v-else-if="customerInfo" class="customer-info">
                                    <div class="customer-avatar">
                                        <i class="fas fa-user-circle"></i>
                                    </div>
                                    <div class="customer-details">
                                        <h5>{{ customerInfo.fullName || customerInfo.name || 'Khách hàng' }}</h5>
                                        <div class="contact-info">
                                            <div class="contact-item" v-if="customerInfo.email">
                                                <i class="fas fa-envelope"></i>
                                                <span>{{ customerInfo.email }}</span>
                                            </div>
                                            <div class="contact-item" v-if="customerInfo.phoneNumber">
                                                <i class="fas fa-phone"></i>
                                                <span>{{ customerInfo.phoneNumber }}</span>
                                            </div>
                                            <div class="contact-item">
                                                <i class="fas fa-id-badge"></i>
                                                <span>ID: {{ selectedOrder.userId }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="error-state">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>Không thể tải thông tin khách hàng</span>
                                </div>
                            </div>
                        </div>

                        <!-- Delivery Info Card -->
                        <div class="info-card">
                            <div class="card-header">
                                <i class="fas fa-shipping-fast"></i>
                                <h4>Thông tin giao hàng</h4>
                            </div>
                            <div class="card-content">
                                <div class="delivery-info">
                                    <div class="address-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div>
                                            <span class="label">Địa chỉ giao hàng</span>
                                            <span class="value">{{ selectedOrder.address || 'Chưa có địa chỉ' }}</span>
                                        </div>
                                    </div>
                                    <div class="note-item" v-if="selectedOrder.note">
                                        <i class="fas fa-sticky-note"></i>
                                        <div>
                                            <span class="label">Ghi chú</span>
                                            <span class="value">{{ selectedOrder.note }}</span>
                                        </div>
                                    </div>
                                    <div class="reason-item" v-if="selectedOrder.reason">
                                        <i class="fas fa-exclamation-circle"></i>
                                        <div>
                                            <span class="label">Lý do hủy</span>
                                            <span class="value reason-text">{{ selectedOrder.reason }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order Items Card -->
                        <div class="info-card">
                            <div class="card-header">
                                <i class="fas fa-utensils"></i>
                                <h4>Chi tiết món ăn</h4>
                            </div>
                            <div class="card-content">
                                <div class="order-items">
                                    <div v-for="item in selectedOrder.orderDetails || []" :key="item.orderDetailId"
                                        class="order-item">
                                        <div class="item-image">
                                            <img :src="item.itemImage?.thumbnailUrl || item.itemImage?.url"
                                                :alt="item.itemName" />
                                        </div>
                                        <div class="item-details">
                                            <h5 class="item-name">{{ item.itemName }}</h5>
                                            <div class="item-meta">
                                                <span class="item-type">{{ item.foodId ? 'Món ăn' : 'Combo' }}</span>
                                                <span class="item-id">ID: {{ item.foodId || item.comboId }}</span>
                                            </div>
                                            <div class="price-info">
                                                <div class="price-row"
                                                    v-if="item.originalPrice !== item.discountedPrice">
                                                    <span class="original-price">{{ formatCurrency(item.originalPrice)
                                                        }}</span>
                                                    <span class="discounted-price">{{
                                                        formatCurrency(item.discountedPrice) }}</span>
                                                </div>
                                                <div class="price-row" v-else>
                                                    <span class="current-price">{{ formatCurrency(item.discountedPrice)
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="item-quantity">
                                            <span class="quantity">x{{ item.quantity }}</span>
                                        </div>
                                        <div class="item-total">
                                            <span class="total-price">{{ formatCurrency(item.totalPrice) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Order Summary Card -->
                        <div class="info-card summary-card">
                            <div class="card-header">
                                <i class="fas fa-calculator"></i>
                                <h4>Tổng kết đơn hàng</h4>
                            </div>
                            <div class="card-content">
                                <div class="order-summary">
                                    <div class="summary-row">
                                        <span>Tổng phụ:</span>
                                        <span>{{ formatCurrency(selectedOrder.subtotalAmount) }}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>Phí ship:</span>
                                        <span>{{ formatCurrency(selectedOrder.shipFee) }}</span>
                                    </div>
                                    <div class="summary-row discount-row"
                                        v-if="selectedOrder.voucherDiscountAmount > 0">
                                        <span><i class="fas fa-tag"></i> Giảm giá voucher:</span>
                                        <span class="discount">-{{ formatCurrency(selectedOrder.voucherDiscountAmount)
                                        }}</span>
                                    </div>
                                </div>
                                <div class="total-summary">
                                    <div class="total-row">
                                        <span class="total-label">Tổng cộng:</span>
                                        <span class="total-amount">{{ formatCurrency(selectedOrder.totalAmount)
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Update Modal -->
        <div v-if="showUpdateModal" class="modal-overlay" @click="closeUpdateModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Cập nhật trạng thái đơn hàng</h3>
                    <button @click="closeUpdateModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Trạng thái hiện tại:</label>
                        <span :class="['status-badge', getStatusClass(selectedOrder?.status)]">
                            {{ getStatusText(selectedOrder?.status) }}
                        </span>
                    </div>

                    <div class="form-group">
                        <label for="newStatus">Trạng thái mới:</label>
                        <select id="newStatus" v-model="newStatus" class="form-select">
                            <option value="1">Đã xác nhận</option>
                            <option value="2">Đang xử lý</option>
                            <option value="3">Đã làm xong</option>
                            <option value="4">Đang giao hàng</option>
                            <option value="5">Hoàn thành</option>
                            <option value="6">Hủy đơn</option>
                        </select>
                    </div>

                    <div class="modal-actions">
                        <button @click="closeUpdateModal" class="btn btn-secondary">
                            Hủy
                        </button>
                        <button @click="updateOrderStatus" class="btn btn-primary" :disabled="!newStatus">
                            Cập nhật
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Cancel Order Modal -->
        <div v-if="showCancelModalRef" class="modal-overlay" @click="closeCancelModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Hủy đơn hàng #{{ selectedOrder?.orderCode }}</h3>
                    <button @click="closeCancelModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Chọn lý do hủy đơn hàng:</label>
                        <div class="cancel-reasons">
                            <label class="reason-option">
                                <input type="radio" v-model="cancelReason" value="Khách hàng yêu cầu hủy">
                                <span>Khách hàng yêu cầu hủy</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" v-model="cancelReason" value="Hết nguyên liệu">
                                <span>Hết nguyên liệu</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" v-model="cancelReason" value="Không thể liên lạc khách hàng">
                                <span>Không thể liên lạc khách hàng</span>
                            </label>
                            <label class="reason-option">
                                <input type="radio" v-model="cancelReason" value="other">
                                <span>Lý do khác</span>
                            </label>
                        </div>
                    </div>

                    <div v-if="cancelReason === 'other'" class="form-group">
                        <label for="customReason">Nhập lý do cụ thể:</label>
                        <textarea id="customReason" v-model="customCancelReason" class="form-textarea"
                            placeholder="Vui lòng nhập lý do hủy đơn hàng..." rows="3"></textarea>
                    </div>

                    <div class="modal-actions">
                        <button @click="closeCancelModal" class="btn btn-secondary">
                            Hủy bỏ
                        </button>
                        <button @click="confirmCancelOrder" class="btn btn-danger"
                            :disabled="!cancelReason || (cancelReason === 'other' && !customCancelReason.trim())">
                            <i class="fas fa-times"></i>
                            Xác nhận hủy đơn
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div v-if="toast.show" :class="['toast-notification', `toast-${toast.type}`]" @click="hideToast">
            <div class="toast-content">
                <div class="toast-icon">
                    <i v-if="toast.type === 'success'" class="fas fa-check-circle"></i>
                    <i v-else-if="toast.type === 'error'" class="fas fa-exclamation-circle"></i>
                    <i v-else-if="toast.type === 'warning'" class="fas fa-exclamation-triangle"></i>
                    <i v-else-if="toast.type === 'info'" class="fas fa-info-circle"></i>
                </div>
                <div class="toast-message">{{ toast.message }}</div>
                <button @click="hideToast" class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { getUserById } from '@/services/userService'

export default {
    name: 'BillManagementView',
    setup() {
        const orderStore = useOrderStore()

        // Reactive data
        const searchQuery = ref({
            orderCode: '',
            status: '',
            page: 1,
            pageSize: 10
        })

        const showDetailsModal = ref(false)
        const showUpdateModal = ref(false)
        const showCancelModalRef = ref(false)
        const selectedOrder = ref(null)
        const newStatus = ref('')
        const cancelReason = ref('')
        const customCancelReason = ref('')
        const customerInfo = ref(null)
        const loadingCustomer = ref(false)
        const customerNames = ref(new Map()) // Map để lưu userId -> customerName
        const loadingCustomerNames = ref(false)

        // Toast notification
        const toast = ref({
            show: false,
            message: '',
            type: 'success' // success, error, warning, info
        })

        // Computed
        const currentPage = computed(() => orderStore.currentPage)
        const totalPages = computed(() => orderStore.totalPages)

        // Methods
        const loadOrders = async (customQuery = {}) => {
            await orderStore.fetchOrders(customQuery)
            // Load customer names for all orders
            await loadCustomerNames()
        }

        const loadCustomerNames = async () => {
            const userIds = [...new Set(orderStore.orders.map(order => order.userId))]
            loadingCustomerNames.value = true

            for (const userId of userIds) {
                if (!customerNames.value.has(userId)) {
                    try {
                        const response = await getUserById(userId)
                        const customerName = response.data.fullName || response.data.name || `User ${userId}`
                        customerNames.value.set(userId, customerName)
                    } catch (error) {
                        console.error(`Failed to load customer ${userId}:`, error)
                        customerNames.value.set(userId, `User ${userId}`)
                    }
                }
            }
            loadingCustomerNames.value = false
        }

        const getCustomerName = (userId) => {
            if (loadingCustomerNames.value && !customerNames.value.has(userId)) {
                return 'Đang tải...'
            }
            return customerNames.value.get(userId) || `User ${userId}`
        }

        const handleSearch = () => {
            const query = {
                ...searchQuery.value,
                page: 1
            }
            loadOrders(query)
        }

        const filterByStatus = (status) => {
            searchQuery.value.status = status
            searchQuery.value.page = 1
            handleSearch()
        }

        const clearFilters = () => {
            searchQuery.value = {
                orderCode: '',
                status: '',
                page: 1,
                pageSize: 10
            }
            loadOrders(searchQuery.value)
        }

        const goToPage = (page) => {
            searchQuery.value.page = page
            loadOrders(searchQuery.value)
        }

        const viewOrderDetails = async (order) => {
            selectedOrder.value = order
            customerInfo.value = null
            showDetailsModal.value = true

            // Load customer info
            if (order.userId) {
                loadingCustomer.value = true
                try {
                    const response = await getUserById(order.userId)
                    customerInfo.value = response.data
                } catch (error) {
                    console.error('Failed to load customer info:', error)
                    customerInfo.value = null
                } finally {
                    loadingCustomer.value = false
                }
            }
        }

        const closeDetailsModal = () => {
            showDetailsModal.value = false
            selectedOrder.value = null
            customerInfo.value = null
        }

        const showStatusModal = (order) => {
            selectedOrder.value = order
            newStatus.value = ''
            showUpdateModal.value = true
        }

        const closeUpdateModal = () => {
            showUpdateModal.value = false
            selectedOrder.value = null
            newStatus.value = ''
        }

        const showCancelModal = (order) => {
            selectedOrder.value = order
            cancelReason.value = ''
            customCancelReason.value = ''
            showCancelModalRef.value = true
        }

        const closeCancelModal = () => {
            showCancelModalRef.value = false
            selectedOrder.value = null
            cancelReason.value = ''
            customCancelReason.value = ''
        }

        const confirmCancelOrder = async () => {
            if (!selectedOrder.value || !cancelReason.value) return

            // Determine final reason
            const finalReason = cancelReason.value === 'other'
                ? customCancelReason.value.trim()
                : cancelReason.value

            if (!finalReason) return

            try {
                const result = await orderStore.changeOrderStatus({
                    orderId: selectedOrder.value.orderId,
                    newStatus: 6,
                    reason: finalReason
                })

                closeCancelModal()

                // Sử dụng message từ API response
                if (orderStore.successMessage) {
                    showToast(orderStore.successMessage, 'success')
                } else {
                    showToast('Đã hủy đơn hàng thành công', 'success')
                }

                // Load lại danh sách đơn hàng
                await loadOrders(searchQuery.value)
            } catch (error) {
                console.error('Failed to cancel order:', error)
                const errorMessage = orderStore.error || 'Hủy đơn hàng thất bại. Vui lòng thử lại!'
                showToast(errorMessage, 'error')
            }
        }

        const updateOrderStatus = async () => {
            if (!selectedOrder.value || !newStatus.value) return

            try {
                const result = await orderStore.changeOrderStatus({
                    orderId: selectedOrder.value.orderId,
                    newStatus: parseInt(newStatus.value)
                })

                closeUpdateModal()

                // Sử dụng message từ API response
                if (orderStore.successMessage) {
                    showToast(orderStore.successMessage, 'success')
                } else {
                    const statusText = getStatusText(parseInt(newStatus.value))
                    showToast(`Cập nhật trạng thái đơn hàng thành công: ${statusText}`, 'success')
                }

                // Load lại danh sách đơn hàng
                await loadOrders(searchQuery.value)
            } catch (error) {
                console.error('Failed to update order status:', error)
                // Hiển thị error message từ store nếu có, hoặc message mặc định
                const errorMessage = orderStore.error || 'Cập nhật trạng thái thất bại. Vui lòng thử lại!'
                showToast(errorMessage, 'error')
            }
        }

        const quickUpdateStatus = async (order, newStatusValue) => {
            try {
                const result = await orderStore.changeOrderStatus({
                    orderId: order.orderId,
                    newStatus: newStatusValue
                })

                // Sử dụng message từ API response
                if (orderStore.successMessage) {
                    showToast(orderStore.successMessage, 'success')
                } else {
                    const statusText = getStatusText(newStatusValue)
                    showToast(`Cập nhật trạng thái đơn hàng thành công: ${statusText}`, 'success')
                }

                // Load lại danh sách đơn hàng
                await loadOrders(searchQuery.value)
            } catch (error) {
                console.error('Failed to update order status:', error)
                // Hiển thị error message từ store nếu có, hoặc message mặc định
                const errorMessage = orderStore.error || 'Cập nhật trạng thái thất bại. Vui lòng thử lại!'
                showToast(errorMessage, 'error')
            }
        }

        // Utility functions
        const formatDate = (dateString) => {
            if (!dateString) return 'Chưa có'
            const date = new Date(dateString)
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const formatCurrency = (amount) => {
            if (!amount) return '0 ₫'
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount)
        }

        const getStatusClass = (status) => {
            const statusMap = {
                0: 'status-pending',
                1: 'status-accepted',
                2: 'status-processing',
                3: 'status-done',
                4: 'status-shipping',
                5: 'status-completed',
                6: 'status-cancelled'
            }
            return statusMap[status] || 'status-default'
        }

        const getStatusText = (status) => {
            const statusMap = {
                0: 'Chờ xử lý',
                1: 'Đã xác nhận',
                2: 'Đang xử lý',
                3: 'Đã làm xong',
                4: 'Đang giao hàng',
                5: 'Hoàn thành',
                6: 'Đã hủy'
            }
            return statusMap[status] || 'Không xác định'
        }

        const getPaymentStatusClass = (paymentStatus) => {
            const statusMap = {
                0: 'payment-pending',
                1: 'payment-paid',
                2: 'payment-failed',
                3: 'payment-refunded'
            }
            return statusMap[paymentStatus] || 'payment-default'
        }

        const getPaymentStatusText = (paymentStatus) => {
            const statusMap = {
                0: 'Chờ thanh toán',
                1: 'Đã thanh toán',
                2: 'Thanh toán thất bại',
                3: 'Đã hoàn tiền'
            }
            return statusMap[paymentStatus] || 'Chưa xác định'
        }

        const getPaymentMethodText = (paymentMethod) => {
            const methodMap = {
                0: 'Tiền mặt',
                1: 'VNPay'
            }
            return methodMap[paymentMethod] || 'Không xác định'
        }

        const canUpdateStatus = (status) => {
            return ![5, 6].includes(status) // Không cho cập nhật nếu đã hoàn thành hoặc đã hủy
        }

        // Toast functions
        const showToast = (message, type = 'success') => {
            toast.value = {
                show: true,
                message,
                type
            }
            // Auto hide after 3 seconds
            setTimeout(() => {
                toast.value.show = false
            }, 3000)
        }

        const hideToast = () => {
            toast.value.show = false
        }

        // Lifecycle
        onMounted(() => {
            loadOrders()
        })

        return {
            orderStore,
            searchQuery,
            showDetailsModal,
            showUpdateModal,
            selectedOrder,
            newStatus,
            customerInfo,
            loadingCustomer,
            currentPage,
            totalPages,
            toast,
            showCancelModalRef,
            cancelReason,
            customCancelReason,
            loadOrders,
            handleSearch,
            filterByStatus,
            clearFilters,
            goToPage,
            viewOrderDetails,
            closeDetailsModal,
            showStatusModal,
            closeUpdateModal,
            updateOrderStatus,
            quickUpdateStatus,
            showCancelModal,
            closeCancelModal,
            confirmCancelOrder,
            getCustomerName,
            formatDate,
            formatCurrency,
            getStatusClass,
            getStatusText,
            getPaymentStatusClass,
            getPaymentStatusText,
            getPaymentMethodText,
            canUpdateStatus,
            showToast,
            hideToast
        }
    }
}
</script>

<style scoped>
.bill-management {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: 100vh;
}

.header {
    margin-bottom: 20px;
}

.header h2 {
    color: #333;
    font-size: 24px;
    font-weight: 600;
}

/* Search Section */
.search-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.search-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 400px;
}

.search-input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
}

.search-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-btn:hover {
    background-color: #0056b3;
}

.search-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.search-row {
    display: flex;
    align-items: center;
    gap: 15px;
    justify-content: space-between;
    flex-wrap: wrap;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    max-width: 400px;
}

.filter-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.status-filter-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.status-filter-section h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #333;
}

.clear-btn {
    padding: 10px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.clear-btn:hover {
    background-color: #545b62;
}

.status-filter-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 8px 16px;
    border: 2px solid #e5e5e5;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.filter-btn:hover {
    border-color: #007bff;
    background-color: #f8f9ff;
}

.filter-btn.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.filter-btn.status-pending.active {
    background-color: #ffc107;
    border-color: #ffc107;
    color: #000;
}

.filter-btn.status-accepted.active {
    background-color: #28a745;
    border-color: #28a745;
}

.filter-btn.status-processing.active {
    background-color: #17a2b8;
    border-color: #17a2b8;
}

.filter-btn.status-done.active {
    background-color: #6f42c1;
    border-color: #6f42c1;
}

.filter-btn.status-shipping.active {
    background-color: #fd7e14;
    border-color: #fd7e14;
}

.filter-btn.status-completed.active {
    background-color: #20c997;
    border-color: #20c997;
}

.filter-btn.status-cancelled.active {
    background-color: #dc3545;
    border-color: #dc3545;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    min-width: 150px;
}

.clear-btn {
    padding: 8px 12px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.clear-btn:hover {
    background-color: #545b62;
}

/* Loading and Error */
.loading,
.error {
    text-align: center;
    padding: 40px;
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
}

.loading {
    color: #007bff;
}

.error {
    color: #dc3545;
}

/* Orders Container */
.orders-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.no-data i {
    font-size: 48px;
    margin-bottom: 15px;
    opacity: 0.5;
}

.no-data h3 {
    margin: 15px 0 10px 0;
    font-size: 18px;
}

/* Orders Grid */
.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.order-card {
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.order-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
}

.order-code {
    font-size: 16px;
    color: #007bff;
}

.order-date {
    font-size: 12px;
    color: #6c757d;
}

.order-info {
    margin-bottom: 15px;
}

.order-info>div {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.order-info i {
    width: 16px;
    color: #6c757d;
}

.order-status {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

/* Status Badges */
.status-badge,
.payment-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
}

.status-pending {
    background-color: #fff3cd;
    color: #856404;
}

.status-accepted {
    background-color: #d4edda;
    color: #155724;
}

.status-processing {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status-done {
    background-color: #e2e3e5;
    color: #383d41;
}

.status-shipping {
    background-color: #ffeaa7;
    color: #856404;
}

.status-completed {
    background-color: #d1f2eb;
    color: #00695c;
}

.status-cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

.status-delivered {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status-cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

.payment-pending {
    background-color: #fff3cd;
    color: #856404;
}

.payment-paid {
    background-color: #d4edda;
    color: #155724;
}

.payment-failed {
    background-color: #f8d7da;
    color: #721c24;
}

.payment-refunded {
    background-color: #e2e3e5;
    color: #383d41;
}

.order-summary {
    margin-bottom: 15px;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
}

.summary-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-amount-1 {
    font-size: 16px;
    font-weight: 600;
    color: #212529;
}

.items-count {
    font-size: 14px;
    color: #6c757d;
    font-weight: 500;
}

.order-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
    align-items: center;
}

/* Buttons */
.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
}

.btn-sm {
    padding: 4px 6px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    min-width: auto;
}

.btn-sm i {
    margin-right: 3px;
    font-size: 10px;
}

.btn-info {
    background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(23, 162, 184, 0.3);
    transition: all 0.3s ease;
}

.btn-info:hover {
    background: linear-gradient(135deg, #138496 0%, #1e7e34 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(23, 162, 184, 0.4);
}

.btn-primary {
    background: linear-gradient(135deg, #007bff 0%, #6610f2 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.3);
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #0056b3 0%, #520dc2 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.4);
}

.btn-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
    transition: all 0.3s ease;
}

.btn-success:hover {
    background: linear-gradient(135deg, #1e7e34 0%, #17a085 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.4);
}

.btn-warning {
    background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    color: #212529;
    border: none;
    box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
    transition: all 0.3s ease;
    font-weight: 600;
}

.btn-warning:hover {
    background: linear-gradient(135deg, #e0a800 0%, #dc6502 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 193, 7, 0.4);
}

.btn-danger {
    background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
    transition: all 0.3s ease;
}

.btn-danger:hover {
    background: linear-gradient(135deg, #c82333 0%, #c0392b 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
}

.btn-secondary {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
    border: none;
    box-shadow: 0 2px 4px rgba(108, 117, 125, 0.3);
    transition: all 0.3s ease;
}

.btn-secondary:hover {
    background: linear-gradient(135deg, #545b62 0%, #343a40 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(108, 117, 125, 0.4);
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e5e5;
}

.pagination-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    font-size: 14px;
    color: #495057;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-content.large {
    max-width: 800px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #dee2e6;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6c757d;
}

.close-btn:hover {
    color: #495057;
}

.modal-body {
    padding: 20px;
}

/* Order Details */
.order-details {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.details-section h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 16px;
    border-bottom: 2px solid #007bff;
    padding-bottom: 5px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.detail-item strong {
    color: #495057;
    font-size: 14px;
}

.detail-item span {
    color: #333;
    font-size: 14px;
}

/* Order Items */
.order-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 1px solid #e5e5e5;
    border-radius: 5px;
    background: #f8f9fa;
}

.item-image {
    flex-shrink: 0;
}

.food-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ddd;
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
}

.item-details {
    font-size: 12px;
    color: #6c757d;
}

.item-details>div {
    margin-bottom: 2px;
}

.item-total {
    font-weight: 600;
    color: #28a745;
    font-size: 16px;
}

.order-total {
    padding-top: 15px;
    border-top: 2px solid #007bff;
}

.total-breakdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.total-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.total-item .discount {
    color: #dc3545;
    font-weight: 600;
}

.final-total {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
    font-size: 16px;
    color: #28a745;
}

/* Form Elements */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #333;
}

.form-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e5e5e5;
}

/* Order Details Modal Styling */
.order-details-modal {
    max-width: 900px;
    max-height: 85vh;
    width: 90vw;
}

.modal-header .header-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.modal-header .order-code {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.order-details-container {
    display: grid;
    gap: 20px;
    padding: 5px;
}

/* Info Cards */
.info-card {
    background: #fff;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s ease;
}

.info-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 15px 20px;
    border-bottom: 1px solid #e1e5e9;
    display: flex;
    align-items: center;
    gap: 10px;
}

.card-header i {
    color: #495057;
    font-size: 16px;
}

.card-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
}

.card-content {
    padding: 20px;
}

/* Status and Basic Info */
.status-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f3f4;
}

.status-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.status-item .label {
    font-size: 13px;
    color: #6c757d;
    font-weight: 500;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    width: fit-content;
}

.status-badge i {
    font-size: 8px;
}

.payment-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    width: fit-content;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.info-item i {
    color: #495057;
    margin-top: 2px;
    font-size: 14px;
}

.info-item div {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item .label {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
}

.info-item .value {
    font-size: 14px;
    color: #212529;
    font-weight: 500;
}

/* Customer Info */
.loading-state,
.error-state {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
    text-align: center;
    justify-content: center;
    color: #6c757d;
}

.customer-info {
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.customer-avatar {
    flex-shrink: 0;
}

.customer-avatar i {
    font-size: 48px;
    color: #495057;
}

.customer-details h5 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #212529;
    font-weight: 600;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #495057;
}

.contact-item i {
    width: 16px;
    color: #6c757d;
}

/* Delivery Info */
.delivery-info {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.address-item,
.note-item,
.reason-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.address-item i,
.note-item i,
.reason-item i {
    color: #495057;
    margin-top: 2px;
    font-size: 14px;
    width: 16px;
}

.reason-item {
    background: #fff5f5;
    border-left: 4px solid #e53e3e;
}

.reason-text {
    color: #e53e3e !important;
}

/* Order Items */
.order-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.order-item {
    display: grid;
    grid-template-columns: 80px 1fr auto auto;
    gap: 15px;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
}

.item-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details h5 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    color: #212529;
}

.item-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
}

.item-type {
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.item-id {
    background: #f3e5f5;
    color: #7b1fa2;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.price-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.price-row {
    display: flex;
    gap: 8px;
    align-items: center;
}

.original-price {
    text-decoration: line-through;
    color: #6c757d;
    font-size: 13px;
}

.discounted-price,
.current-price {
    color: #28a745;
    font-weight: 600;
    font-size: 14px;
}

.item-quantity {
    text-align: center;
}

.quantity {
    background: #495057;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
}

.item-total {
    text-align: right;
}

.total-price {
    font-size: 16px;
    font-weight: 700;
    color: #212529;
}

/* Order Summary */
.summary-card {
    border: 2px solid #e3f2fd;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.order-summary {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e9ecef;
    font-size: 14px;
}

.summary-row:last-child {
    border-bottom: none;
}

.discount-row {
    color: #28a745;
}

.discount-row i {
    margin-right: 5px;
}

.discount {
    color: #28a745;
    font-weight: 600;
}

.total-summary {
    border-top: 2px solid #dee2e6;
    padding-top: 15px;
    margin-top: 15px;
}

.total-row {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.total-label {
    font-size: 18px;
    font-weight: 700;
    color: white;
}

.total-amount {
    font-size: 24px;
    font-weight: 800;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
    .order-details-modal {
        width: 95vw;
        max-height: 90vh;
    }

    .status-row,
    .info-grid {
        grid-template-columns: 1fr;
    }

    .order-item {
        grid-template-columns: 60px 1fr;
        gap: 10px;
    }

    .item-quantity,
    .item-total {
        grid-column: 2;
        text-align: left;
        margin-top: 10px;
    }

    .customer-info {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 768px) {
    .search-controls {
        gap: 10px;
    }

    .filter-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-select {
        min-width: auto;
    }

    .orders-grid {
        grid-template-columns: 1fr;
    }

    .order-actions {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 5px;
    }

    .order-actions .btn-sm {
        font-size: 9px;
        padding: 3px 5px;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .modal-content {
        margin: 10px;
        width: calc(100% - 20px);
    }

    .status-filter-buttons {
        gap: 8px;
    }

    .filter-btn {
        padding: 6px 12px;
        font-size: 11px;
    }
}

/* Toast Notification */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 300px;
    max-width: 500px;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
    cursor: pointer;
}

.toast-content {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 12px;
}

.toast-icon {
    flex-shrink: 0;
    font-size: 20px;
}

.toast-message {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
}

.toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    font-size: 14px;
    opacity: 0.7;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: opacity 0.2s ease;
}

.toast-close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
}

/* Toast Types */
.toast-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
}

.toast-error {
    background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
    color: white;
}

.toast-warning {
    background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
    color: #212529;
}

.toast-info {
    background: linear-gradient(135deg, #17a2b8 0%, #007bff 100%);
    color: white;
}

/* Toast Animation */
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }

    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Customer Info Styles */
.loading-customer {
    text-align: center;
    padding: 20px;
    color: #007bff;
    font-style: italic;
}

.customer-error {
    text-align: center;
    padding: 20px;
    color: #dc3545;
    font-style: italic;
}

.customer-error i {
    margin-right: 8px;
}

/* Cancel Modal Styles */
.cancel-reasons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
}

.reason-option {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #fff;
}

.reason-option:hover {
    border-color: #007bff;
    background-color: #f8f9ff;
}

.reason-option input[type="radio"] {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    accent-color: #007bff;
}

.reason-option input[type="radio"]:checked+span {
    color: #007bff;
    font-weight: 600;
}

.reason-option span {
    flex: 1;
    font-size: 14px;
    color: #495057;
    transition: color 0.3s ease;
}

.form-textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 80px;
    transition: border-color 0.3s ease;
}

.form-textarea:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-textarea::placeholder {
    color: #6c757d;
    font-style: italic;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
}

.btn-danger:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: linear-gradient(135deg, #999 0%, #777 100%);
}

.btn-danger:disabled:hover {
    transform: none;
    box-shadow: none;
}
</style>
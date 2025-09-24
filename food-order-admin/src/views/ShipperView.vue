<template>
    <div class="shipper-view">
        <div class="page-header">
            <h2>Quản lý đơn hàng - Shipper</h2>
            <div class="status-info">
                <div class="status-card done">
                    <i class="fas fa-box"></i>
                    <span class="status-count">{{ doneOrders.length }}</span>
                    <span class="status-label">Đơn sẵn sàng giao</span>
                </div>
                <div class="status-card shipping">
                    <i class="fas fa-truck"></i>
                    <span class="status-count">{{ shippingOrders.length }}</span>
                    <span class="status-label">Đang giao hàng</span>
                </div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="tabs-container">
            <div class="tabs-header">
                <button @click="activeTab = 'receive'" :class="['tab-button', { active: activeTab === 'receive' }]">
                    <i class="fas fa-inbox"></i>
                    Nhận đơn hàng ({{ doneOrders.length }})
                </button>
                <button @click="activeTab = 'deliver'" :class="['tab-button', { active: activeTab === 'deliver' }]">
                    <i class="fas fa-truck"></i>
                    Giao đơn hàng ({{ shippingOrders.length }})
                </button>
            </div>

            <div class="tab-controls">
                <div class="search-box">
                    <input type="text" v-model="searchQuery" @input="filterOrders"
                        placeholder="Tìm theo mã đơn hàng..." />
                    <i class="fas fa-search"></i>
                </div>
                <button @click="refreshOrders" class="refresh-btn">
                    <i class="fas fa-sync-alt"></i> Làm mới
                </button>
            </div>
        </div>

        <!-- Orders List -->
        <div class="orders-container">
            <div v-if="loading" class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                Đang tải dữ liệu...
            </div>

            <div v-else-if="filteredOrders.length === 0" class="no-orders">
                <i class="fas fa-inbox"></i>
                <p>Không có đơn hàng nào</p>
            </div>

            <div v-else class="orders-grid">
                <div v-for="order in filteredOrders" :key="order.orderId" class="order-card"
                    :class="getOrderStatusClass(order.status)">
                    <div class="order-header">
                        <div class="order-id">
                            <strong>#{{ order.orderCode || order.orderId }}</strong>
                            <span class="order-status" :class="getStatusClass(order.status)">
                                {{ getStatusText(order.status) }}
                            </span>
                        </div>
                        <div class="order-time">
                            {{ formatDateTime(order.createdAt) }}
                        </div>
                    </div>

                    <div class="order-info">
                        <div class="customer-info">
                            <h4>Thông tin khách hàng:</h4>
                            <p><i class="fas fa-user"></i> {{ order.recipientName || order.customerName || 'N/A' }}</p>
                            <p><i class="fas fa-phone"></i>
                                <a :href="`tel:${order.recipientPhone || order.phoneNumber}`" class="phone-link">
                                    {{ order.recipientPhone || order.phoneNumber || 'N/A' }}
                                </a>
                            </p>
                            <p><i class="fas fa-map-marker-alt"></i> {{ order.deliveryAddress || order.address || 'N/A'
                            }}</p>
                            <p v-if="order.paymentStatus !== undefined">
                                <i class="fas fa-credit-card"></i>
                                <span :class="getPaymentStatusClass(order.paymentStatus)">
                                    {{ getPaymentStatusText(order.paymentStatus) }}
                                </span>
                            </p>
                        </div>

                        <div class="order-details">
                            <h4>Chi tiết đơn hàng:</h4>
                            <div class="order-items">
                                <div v-for="item in (order.orderItems || [])" :key="item.id || item.orderItemId"
                                    class="order-item">
                                    <span>{{ item.foodName || item.comboName || item.itemName }} x{{ item.quantity
                                    }}</span>
                                    <span>{{ formatPrice((item.price || item.unitPrice || 0) * item.quantity) }}</span>
                                </div>
                            </div>
                            <div class="order-total">
                                <strong>Tổng tiền: {{ formatPrice(order.totalAmount || order.total || 0) }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="order-actions">
                        <button class="btn btn-info btn-sm" @click="viewOrderDetails(order)">
                            <i class="fas fa-eye"></i>
                            Chi tiết
                        </button>

                        <!-- Sẵn sàng giao (status = 3) -->
                        <template v-if="order.status === 3">
                            <button class="btn btn-primary btn-sm" @click="quickUpdateStatus(order, 4)"
                                :disabled="updating">
                                <i class="fas fa-truck"></i>
                                {{ updating ? 'Đang cập nhật...' : 'Bắt đầu giao hàng' }}
                            </button>
                        </template>

                        <!-- Đang giao hàng (status = 4) -->
                        <template v-if="order.status === 4">
                            <button class="btn btn-success btn-sm" @click="quickUpdateStatus(order, 5)"
                                :disabled="updating">
                                <i class="fas fa-check-circle"></i>
                                {{ updating ? 'Đang cập nhật...' : 'Hoàn thành giao hàng' }}
                            </button>
                        </template>

                        <!-- Utility buttons -->
                        <button @click="openMaps(order.deliveryAddress || order.address)"
                            class="btn btn-secondary btn-sm" v-if="order.deliveryAddress || order.address">
                            <i class="fas fa-map"></i>
                            Bản đồ
                        </button>

                        <button @click="callCustomer(order.recipientPhone || order.phoneNumber)"
                            class="btn btn-outline btn-sm" v-if="order.recipientPhone || order.phoneNumber">
                            <i class="fas fa-phone"></i>
                            Gọi điện
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Details Modal -->
        <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal-content order-details-modal" @click.stop>
                <div class="modal-header">
                    <div class="header-info">
                        <h3>Chi tiết đơn hàng</h3>
                        <span class="order-code">#{{ selectedOrder?.orderCode || selectedOrder?.orderId }}</span>
                    </div>
                    <button @click="closeDetailsModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body" v-if="selectedOrder">
                    <div class="order-details-container">
                        <!-- Status and Basic Info Card -->
                        <div class="info-card">
                            <h4>Thông tin cơ bản</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Trạng thái:</label>
                                    <span :class="['status-badge', getStatusClass(selectedOrder.status)]">
                                        {{ getStatusText(selectedOrder.status) }}
                                    </span>
                                </div>
                                <div class="info-item">
                                    <label>Thời gian tạo:</label>
                                    <span>{{ formatDateTime(selectedOrder.createdAt) }}</span>
                                </div>
                                <div class="info-item">
                                    <label>Tổng tiền:</label>
                                    <span class="total-amount">{{ formatPrice(selectedOrder.totalAmount ||
                                        selectedOrder.total
                                        || 0) }}</span>
                                </div>
                                <div class="info-item" v-if="selectedOrder.paymentStatus !== undefined">
                                    <label>Thanh toán:</label>
                                    <span :class="getPaymentStatusClass(selectedOrder.paymentStatus)">
                                        {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Customer Info Card -->
                        <div class="info-card">
                            <h4>Thông tin khách hàng</h4>
                            <div class="customer-details">
                                <div class="customer-item">
                                    <i class="fas fa-user"></i>
                                    <span>{{ selectedOrder.recipientName || selectedOrder.customerName || 'N/A'
                                        }}</span>
                                </div>
                                <div class="customer-item">
                                    <i class="fas fa-phone"></i>
                                    <a :href="`tel:${selectedOrder.recipientPhone || selectedOrder.phoneNumber}`"
                                        class="phone-link">
                                        {{ selectedOrder.recipientPhone || selectedOrder.phoneNumber || 'N/A' }}
                                    </a>
                                </div>
                                <div class="customer-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>{{ selectedOrder.deliveryAddress || selectedOrder.address || 'N/A' }}</span>
                                </div>
                                <div class="customer-item" v-if="selectedOrder.note">
                                    <i class="fas fa-sticky-note"></i>
                                    <span>{{ selectedOrder.note }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Order Items Card -->
                        <div class="info-card">
                            <h4>Chi tiết đơn hàng</h4>
                            <div class="order-items-detail">
                                <div v-for="item in (selectedOrder.orderItems || [])" :key="item.id || item.orderItemId"
                                    class="order-item-detail">
                                    <div class="item-info">
                                        <span class="item-name">{{ item.foodName || item.comboName || item.itemName
                                            }}</span>
                                        <span class="item-quantity">x{{ item.quantity }}</span>
                                    </div>
                                    <div class="item-price">
                                        {{ formatPrice((item.price || item.unitPrice || 0) * item.quantity) }}
                                    </div>
                                </div>
                                <div class="order-total-detail">
                                    <strong>Tổng cộng: {{ formatPrice(selectedOrder.totalAmount || selectedOrder.total
                                        || 0)
                                        }}</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Action buttons in modal -->
                        <div class="modal-actions">
                            <template v-if="selectedOrder.status === 3">
                                <button class="btn btn-primary" @click="quickUpdateStatus(selectedOrder, 4)"
                                    :disabled="updating">
                                    <i class="fas fa-truck"></i>
                                    {{ updating ? 'Đang cập nhật...' : 'Bắt đầu giao hàng' }}
                                </button>
                            </template>

                            <template v-if="selectedOrder.status === 4">
                                <button class="btn btn-success" @click="quickUpdateStatus(selectedOrder, 5)"
                                    :disabled="updating">
                                    <i class="fas fa-check-circle"></i>
                                    {{ updating ? 'Đang cập nhật...' : 'Hoàn thành giao hàng' }}
                                </button>
                            </template>

                            <button @click="openMaps(selectedOrder.deliveryAddress || selectedOrder.address)"
                                class="btn btn-secondary" v-if="selectedOrder.deliveryAddress || selectedOrder.address">
                                <i class="fas fa-map"></i>
                                Mở bản đồ
                            </button>

                            <button @click="callCustomer(selectedOrder.recipientPhone || selectedOrder.phoneNumber)"
                                class="btn btn-info" v-if="selectedOrder.recipientPhone || selectedOrder.phoneNumber">
                                <i class="fas fa-phone"></i>
                                Gọi điện
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useOrderStore } from '@/stores/orderStore'
import { formatPrice, formatDateTime } from '@/utils/format'
import { useToast } from 'vue-toastification'

export default {
    name: 'ShipperView',
    setup() {
        const orderStore = useOrderStore()
        const toast = useToast()

        return {
            orderStore,
            toast
        }
    },
    data() {
        return {
            activeTab: 'receive', // 'receive' or 'deliver'
            filteredOrders: [],
            updating: false,
            searchQuery: '',
            doneOrdersCache: [], // Cache for done orders
            shippingOrdersCache: [], // Cache for shipping orders
            showDetailsModal: false,
            selectedOrder: null,
            orderStatuses: {
                0: 'Chờ xử lý',
                1: 'Nhà hàng đã xác nhận',
                2: 'Đang xử lý',
                3: 'Sẵn sàng giao',
                4: 'Đang giao hàng',
                5: 'Hoàn thành',
                6: 'Đã hủy'
            }
        }
    },
    computed: {
        loading() {
            return this.orderStore.loading
        },
        orders() {
            return this.orderStore.orders || []
        },
        doneOrders() {
            return this.doneOrdersCache
        },
        shippingOrders() {
            return this.shippingOrdersCache
        },
        currentTabOrders() {
            return this.activeTab === 'receive' ? this.doneOrdersCache : this.shippingOrdersCache
        }
    },
    async mounted() {
        await this.fetchBothTabs()
        // Auto refresh every 2 minutes
        setInterval(this.fetchBothTabs, 120000)
    },
    methods: {
        async fetchOrders(specificTab = null) {
            try {
                const tab = specificTab || this.activeTab
                const status = tab === 'receive' ? '3' : '4' // Status 3 for receive, 4 for deliver

                await this.orderStore.fetchOrders({
                    status: status,
                    pageSize: 100,
                    page: 1
                })

                // Cache the results based on which tab we're fetching for
                if (tab === 'receive') {
                    this.doneOrdersCache = [...this.orderStore.orders]
                } else {
                    this.shippingOrdersCache = [...this.orderStore.orders]
                }

                this.filterOrders()
            } catch (error) {
                console.error('Error fetching orders:', error)
                this.toast.error('Lỗi khi tải danh sách đơn hàng')
            }
        },

        async fetchBothTabs() {
            // Fetch both tabs to get accurate counts
            await this.fetchOrders('receive')
            await this.fetchOrders('deliver')
        },

        async refreshOrders() {
            await this.fetchBothTabs()
            this.toast.success('Đã làm mới danh sách đơn hàng')
        },

        filterOrders() {
            // Start with orders from current tab
            let filtered = [...this.currentTabOrders]

            // Filter by search query
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase().trim()
                filtered = filtered.filter(order =>
                    (order.orderCode && order.orderCode.toLowerCase().includes(query)) ||
                    (order.orderId && order.orderId.toString().includes(query)) ||
                    (order.customerName && order.customerName.toLowerCase().includes(query)) ||
                    (order.phoneNumber && order.phoneNumber.includes(query))
                )
            }

            this.filteredOrders = filtered
        },

        async updateOrderStatus(orderId, newStatus) {
            this.updating = true
            try {
                // Convert string status to number
                const statusValue = newStatus === 'Shipping' ? 4 : newStatus === 'Completed' ? 5 : newStatus

                await this.orderStore.changeOrderStatus({
                    orderId: orderId,
                    status: statusValue
                })

                // Refresh both tabs to get updated data and accurate counts
                await this.fetchBothTabs()

                const statusText = this.orderStatuses[statusValue]
                this.toast.success(`Đã cập nhật trạng thái đơn hàng #${orderId} thành "${statusText}"`)

            } catch (error) {
                console.error('Error updating order status:', error)
                this.toast.error('Lỗi khi cập nhật trạng thái đơn hàng')
            } finally {
                this.updating = false
            }
        },

        async quickUpdateStatus(order, newStatusValue) {
            this.updating = true
            try {
                await this.orderStore.changeOrderStatus({
                    orderId: order.orderId,
                    newStatus: newStatusValue
                })

                // Sử dụng message từ API response
                if (this.orderStore.successMessage) {
                    this.toast.success(this.orderStore.successMessage)
                } else {
                    const statusText = this.getStatusText(newStatusValue)
                    this.toast.success(`Cập nhật trạng thái đơn hàng thành công: ${statusText}`)
                }

                // Load lại danh sách đơn hàng
                await this.fetchBothTabs()
            } catch (error) {
                console.error('Failed to update order status:', error)
                // Hiển thị error message từ store nếu có, hoặc message mặc định
                const errorMessage = this.orderStore.error || 'Cập nhật trạng thái thất bại. Vui lòng thử lại!'
                this.toast.error(errorMessage)
            } finally {
                this.updating = false
            }
        },

        viewOrderDetails(order) {
            this.selectedOrder = order
            this.showDetailsModal = true
        },

        closeDetailsModal() {
            this.showDetailsModal = false
            this.selectedOrder = null
        },

        getStatusText(status) {
            return this.orderStatuses[status] || `Status ${status}`
        },

        getStatusClass(status) {
            const classes = {
                3: 'status-done',     // Done
                4: 'status-shipping', // Shipping  
                5: 'status-completed' // Completed
            }
            return classes[status] || ''
        },

        getOrderStatusClass(status) {
            const classes = {
                3: 'order-done',
                4: 'order-shipping',
                5: 'order-completed'
            }
            return classes[status] || `order-status-${status}`
        },

        getPaymentStatusText(paymentStatus) {
            const statuses = {
                0: 'Chưa thanh toán',
                1: 'Đã thanh toán',
                2: 'Thanh toán thất bại',
                3: 'Đã hoàn tiền'
            }
            return statuses[paymentStatus] || `Payment Status ${paymentStatus}`
        },

        getPaymentStatusClass(paymentStatus) {
            const classes = {
                0: 'payment-pending',
                1: 'payment-paid',
                2: 'payment-failed',
                3: 'payment-refunded'
            }
            return classes[paymentStatus] || ''
        },

        openMaps(address) {
            if (address) {
                const encodedAddress = encodeURIComponent(address)
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank')
            }
        },

        callCustomer(phoneNumber) {
            if (phoneNumber) {
                window.open(`tel:${phoneNumber}`)
            }
        },

        formatPrice,
        formatDateTime
    },
    watch: {
        activeTab(newTab) {
            // Fetch fresh data for the selected tab
            this.fetchOrders(newTab)
        }
    }
}
</script>

<style scoped>
.shipper-view {
    padding: 20px;
}

.page-header {
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.page-header h2 {
    margin: 0;
    color: #333;
    font-size: 2rem;
}

.status-info {
    display: flex;
    gap: 20px;
}

.status-card {
    color: white;
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    min-width: 140px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease;
}

.status-card:hover {
    transform: translateY(-2px);
}

.status-card.done {
    background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
}

.status-card.shipping {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.status-card.total {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
}

.status-card i {
    display: block;
    font-size: 1.5rem;
    margin-bottom: 8px;
    opacity: 0.9;
}

.status-count {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
}

.status-label {
    font-size: 0.9rem;
    opacity: 0.9;
}

.tabs-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    overflow: hidden;
}

.tabs-header {
    display: flex;
    border-bottom: 1px solid #eee;
}

.tab-button {
    flex: 1;
    padding: 20px;
    border: none;
    background: #f8f9fa;
    color: #666;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.tab-button:hover {
    background: #e9ecef;
    color: #495057;
}

.tab-button.active {
    background: white;
    color: #007bff;
    border-bottom: 3px solid #007bff;
}

.tab-button i {
    font-size: 1.2rem;
}

.tab-controls {
    padding: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 300px;
}

.search-box input {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
}

.search-box i {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
}

.refresh-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.refresh-btn:hover {
    background: #218838;
}

.orders-container {
    min-height: 400px;
}

.loading,
.no-orders {
    text-align: center;
    padding: 60px 20px;
    color: #666;
    font-size: 1.1rem;
}

.loading i {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #667eea;
}

.no-orders i {
    font-size: 3rem;
    margin-bottom: 15px;
    color: #ccc;
}

.orders-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
}

.order-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    border-left: 5px solid #ddd;
}

.order-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.order-card.order-done {
    border-left-color: #ffc107;
}

.order-card.order-shipping {
    border-left-color: #17a2b8;
}

.order-header {
    background: #f8f9fa;
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-id {
    display: flex;
    align-items: center;
    gap: 10px;
}

.order-status {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-done {
    background: #fff3cd;
    color: #856404;
}

.status-shipping {
    background: #d1ecf1;
    color: #0c5460;
}

.status-completed {
    background: #d4edda;
    color: #155724;
}

.order-time {
    color: #666;
    font-size: 0.9rem;
}

.order-info {
    padding: 20px;
}

.customer-info,
.order-details {
    margin-bottom: 20px;
}

.customer-info h4,
.order-details h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 1rem;
}

.customer-info p {
    margin: 5px 0;
    color: #555;
    display: flex;
    align-items: center;
    gap: 8px;
}

.customer-info i {
    width: 16px;
    color: #667eea;
}

.phone-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
}

.phone-link:hover {
    text-decoration: underline;
}

.payment-pending {
    color: #ffc107;
    font-weight: 600;
}

.payment-paid {
    color: #28a745;
    font-weight: 600;
}

.payment-failed {
    color: #dc3545;
    font-weight: 600;
}

.payment-refunded {
    color: #6c757d;
    font-weight: 600;
}

.order-items {
    margin-bottom: 10px;
}

.order-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-total {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 2px solid #f0f0f0;
    color: #333;
}

.order-actions {
    padding: 15px 20px;
    border-top: 1px solid #f0f0f0;
    background: #f8f9fa;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    justify-content: center;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #1e7e34;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #545b62;
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-info:hover:not(:disabled) {
    background: #138496;
}

.btn-sm {
    padding: 8px 16px;
    font-size: 0.8rem;
    width: auto;
}

.btn-outline {
    background: transparent;
    border: 1px solid #17a2b8;
    color: #17a2b8;
}

.btn-outline:hover:not(:disabled) {
    background: #17a2b8;
    color: white;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-info h3 {
    margin: 0;
    color: #333;
}

.order-code {
    color: #666;
    font-size: 0.9rem;
    margin-top: 5px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #f0f0f0;
    color: #333;
}

.modal-body {
    padding: 20px;
}

.order-details-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-card {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
}

.info-card h4 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.1rem;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item label {
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-done {
    background: #fff3cd;
    color: #856404;
}

.status-shipping {
    background: #d1ecf1;
    color: #0c5460;
}

.status-completed {
    background: #d4edda;
    color: #155724;
}

.total-amount {
    font-weight: bold;
    color: #28a745;
    font-size: 1.1rem;
}

.customer-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.customer-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.customer-item i {
    width: 20px;
    color: #667eea;
}

.order-items-detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.order-item-detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
}

.item-info {
    display: flex;
    gap: 10px;
    align-items: center;
}

.item-name {
    font-weight: 500;
}

.item-quantity {
    color: #666;
    font-size: 0.9rem;
}

.item-price {
    font-weight: 600;
    color: #333;
}

.order-total-detail {
    margin-top: 10px;
    padding-top: 15px;
    border-top: 2px solid #333;
    text-align: right;
    font-size: 1.1rem;
}

.modal-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
}

@media (max-width: 768px) {
    .orders-grid {
        grid-template-columns: 1fr;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .status-info {
        width: 100%;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 10px;
    }

    .status-card {
        min-width: 100px;
        flex: 1;
    }

    .tab-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .search-box {
        min-width: 100%;
    }

    .tab-button {
        padding: 15px;
        font-size: 0.9rem;
    }

    .utility-buttons {
        justify-content: center;
    }

    .order-actions {
        flex-direction: column;
        gap: 8px;
    }

    .order-actions .btn {
        width: 100%;
    }

    .modal-overlay {
        padding: 10px;
    }

    .modal-content {
        max-height: 95vh;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .modal-actions {
        flex-direction: column;
    }

    .modal-actions .btn {
        width: 100%;
    }
}
</style>
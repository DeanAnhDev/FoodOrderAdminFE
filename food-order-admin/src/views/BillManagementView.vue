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
                        <div class="total-amount">
                            <strong>{{ formatCurrency(order.totalAmount) }}</strong>
                        </div>
                        <div class="items-count">
                            {{ order.orderDetails?.length || 0 }} món
                        </div>
                    </div>

                    <div class="order-actions">
                        <button class="btn btn-info btn-sm" @click.stop="viewOrderDetails(order)">
                            <i class="fas fa-eye"></i>
                            Chi tiết
                        </button>
                        <button v-if="canUpdateStatus(order.status)" class="btn btn-primary btn-sm"
                            @click.stop="showStatusModal(order)">
                            <i class="fas fa-edit"></i>
                            Cập nhật
                        </button>
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
            <div class="modal-content large" @click.stop>
                <div class="modal-header">
                    <h3>Chi tiết đơn hàng #{{ selectedOrder?.orderCode || selectedOrder?.id }}</h3>
                    <button @click="closeDetailsModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" v-if="selectedOrder">
                    <div class="order-details">
                        <div class="details-section">
                            <h4>Thông tin đơn hàng</h4>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <strong>Mã đơn hàng:</strong>
                                    <span>#{{ selectedOrder.orderCode }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Ngày đặt:</strong>
                                    <span>{{ formatDate(selectedOrder.createdAt) }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Trạng thái:</strong>
                                    <span :class="['status-badge', getStatusClass(selectedOrder.status)]">
                                        {{ getStatusText(selectedOrder.status) }}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <strong>Thanh toán:</strong>
                                    <span
                                        :class="['payment-badge', getPaymentStatusClass(selectedOrder.paymentStatus)]">
                                        {{ getPaymentStatusText(selectedOrder.paymentStatus) }}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <strong>Phương thức thanh toán:</strong>
                                    <span>{{ getPaymentMethodText(selectedOrder.paymentMethod) }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Lý do hủy:</strong>
                                    <span>{{ selectedOrder.reason || 'Không có' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>Thông tin khách hàng</h4>
                            <div v-if="loadingCustomer" class="loading-customer">
                                <i class="fas fa-spinner fa-spin"></i> Đang tải thông tin khách hàng...
                            </div>
                            <div v-else-if="customerInfo" class="details-grid">
                                <div class="detail-item">
                                    <strong>Tên khách hàng:</strong>
                                    <span>{{ customerInfo.fullName || customerInfo.name || 'Chưa có tên' }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Email:</strong>
                                    <span>{{ customerInfo.email || 'Chưa có email' }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Số điện thoại:</strong>
                                    <span>{{ customerInfo.phoneNumber || 'Chưa có SĐT' }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>User ID:</strong>
                                    <span>{{ selectedOrder.userId }}</span>
                                </div>
                            </div>
                            <div v-else class="customer-error">
                                <i class="fas fa-exclamation-triangle"></i>
                                Không thể tải thông tin khách hàng
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>Thông tin đơn hàng</h4>
                            <div class="details-grid">
                                <div class="detail-item">
                                    <strong>Ghi chú:</strong>
                                    <span>{{ selectedOrder.note || 'Không có ghi chú' }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Địa chỉ giao hàng:</strong>
                                    <span>{{ selectedOrder.address || 'Chưa có địa chỉ' }}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Voucher ID:</strong>
                                    <span>{{ selectedOrder.voucherId || 'Không sử dụng' }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="details-section">
                            <h4>Chi tiết món ăn</h4>
                            <div class="order-items">
                                <div v-for="item in selectedOrder.orderDetails || []" :key="item.orderDetailId"
                                    class="order-item">
                                    <div class="item-image">
                                        <img :src="item.itemImage?.thumbnailUrl || item.itemImage?.url"
                                            :alt="item.itemName" class="food-image" />
                                    </div>
                                    <div class="item-info">
                                        <div class="item-name">{{ item.itemName }}</div>
                                        <div class="item-details">
                                            <div>Số lượng: {{ item.quantity }}</div>
                                            <div>Giá gốc: {{ formatCurrency(item.originalPrice) }}</div>
                                            <div>Giá sau giảm: {{ formatCurrency(item.discountedPrice) }}</div>
                                            <div>{{ item.foodId ? 'Món ăn' : 'Combo' }} ID: {{ item.foodId ||
                                                item.comboId }}</div>
                                        </div>
                                    </div>
                                    <div class="item-total">
                                        {{ formatCurrency(item.totalPrice) }}
                                    </div>
                                </div>
                            </div>

                            <div class="order-total">
                                <div class="total-breakdown">
                                    <div class="total-item">
                                        <span>Tổng phụ:</span>
                                        <span>{{ formatCurrency(selectedOrder.subtotalAmount) }}</span>
                                    </div>
                                    <div class="total-item">
                                        <span>Phí ship:</span>
                                        <span>{{ formatCurrency(selectedOrder.shipFee) }}</span>
                                    </div>
                                    <div class="total-item" v-if="selectedOrder.voucherDiscountAmount > 0">
                                        <span>Giảm giá voucher:</span>
                                        <span class="discount">-{{ formatCurrency(selectedOrder.voucherDiscountAmount)
                                        }}</span>
                                    </div>
                                    <div class="total-row final-total">
                                        <strong>Tổng cộng: {{ formatCurrency(selectedOrder.totalAmount) }}</strong>
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
        const selectedOrder = ref(null)
        const newStatus = ref('')
        const customerInfo = ref(null)
        const loadingCustomer = ref(false)
        const customerNames = ref(new Map()) // Map để lưu userId -> customerName
        const loadingCustomerNames = ref(false)

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

        const updateOrderStatus = async () => {
            if (!selectedOrder.value || !newStatus.value) return

            try {
                await orderStore.changeOrderStatus({
                    orderId: selectedOrder.value.orderId,
                    newStatus: parseInt(newStatus.value)
                })

                closeUpdateModal()
                // Reload orders to reflect changes
                loadOrders(searchQuery.value)
            } catch (error) {
                console.error('Failed to update order status:', error)
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
            getCustomerName,
            formatDate,
            formatCurrency,
            getStatusClass,
            getStatusText,
            getPaymentStatusClass,
            getPaymentStatusText,
            getPaymentMethodText,
            canUpdateStatus
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-top: 10px;
    border-top: 1px solid #f0f0f0;
}

.total-amount {
    font-size: 16px;
    color: #28a745;
}

.items-count {
    font-size: 14px;
    color: #6c757d;
}

.order-actions {
    display: flex;
    gap: 10px;
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
    padding: 4px 8px;
    font-size: 11px;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn-info:hover {
    background-color: #138496;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #545b62;
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

/* Responsive */
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
        flex-direction: column;
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
</style>
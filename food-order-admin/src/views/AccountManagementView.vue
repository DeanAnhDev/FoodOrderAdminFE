<template>
    <div class="account-management">
        <div class="header">
            <h2>Quản lý tài khoản khách hàng</h2>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-section">
            <div class="search-box">
                <input v-model="searchTerm" type="text" placeholder="Tìm kiếm theo email hoặc số điện thoại..."
                    class="search-input" @keyup.enter="handleSearch" />
                <button @click="handleSearch" class="search-btn">
                    <i class="fas fa-search"></i>
                </button>
                <button @click="clearSearch" class="clear-btn" v-if="searchTerm">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="customerStore.loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>

        <!-- Error State -->
        <div v-if="customerStore.error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ customerStore.error }}
        </div>

        <!-- Customer List Table -->
        <div v-if="!customerStore.loading && !customerStore.error" class="table-container">
            <table class="customer-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái xác thực</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="customerStore.customers.length === 0">
                        <td colspan="6" class="no-data">Không có dữ liệu</td>
                    </tr>
                    <tr v-for="(customer, index) in customerStore.customers" :key="customer.id">
                        <td>{{ getSequentialNumber(index) }}</td>
                        <td>{{ customer.fullName }}</td>
                        <td>{{ customer.email }}</td>
                        <td>{{ customer.phoneNumber }}</td>
                        <td>
                            <div class="verification-status">
                                <span
                                    :class="['status-badge', 'small', customer.emailConfirmed ? 'active' : 'inactive']">
                                    <i class="fas fa-envelope"></i>
                                    {{ customer.emailConfirmed ? 'Email ✓' : 'Email ✗' }}
                                </span>
                                <span
                                    :class="['status-badge', 'small', customer.phoneNumberConfirmed ? 'active' : 'inactive']">
                                    <i class="fas fa-phone"></i>
                                    {{ customer.phoneNumberConfirmed ? 'SĐT ✓' : 'SĐT ✗' }}
                                </span>
                            </div>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button @click="viewCustomer(customer)" class="btn btn-info" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="customerStore.totalPages > 1" class="pagination">
            <button @click="goToPage(customerStore.pageNumber - 1)" :disabled="!customerStore.hasPreviousPage"
                class="pagination-btn">
                <i class="fas fa-chevron-left"></i>
            </button>

            <span class="pagination-info">
                Trang {{ customerStore.pageNumber }} / {{ customerStore.totalPages }}
                ({{ customerStore.totalCount }} khách hàng)
            </span>

            <button @click="goToPage(customerStore.pageNumber + 1)" :disabled="!customerStore.hasNextPage"
                class="pagination-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- Customer Detail Modal -->
        <div v-if="showCustomerDetail" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Chi tiết khách hàng</h3>
                    <button @click="closeModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" v-if="selectedCustomer">
                    <div class="customer-info">
                        <div class="info-row">
                            <strong>Họ tên:</strong>
                            {{ selectedCustomer.fullName }}
                        </div>
                        <div class="info-row">
                            <strong>Email:</strong> {{ selectedCustomer.email }}
                        </div>
                        <div class="info-row">
                            <strong>Số điện thoại:</strong> {{ selectedCustomer.phoneNumber }}
                        </div>
                        <div class="info-row">
                            <strong>Tên đăng nhập:</strong> {{ selectedCustomer.userName }}
                        </div>
                        <div class="info-row">
                            <strong>Email xác thực:</strong>
                            <span :class="['status-badge', selectedCustomer.emailConfirmed ? 'active' : 'inactive']">
                                {{ selectedCustomer.emailConfirmed ? 'Đã xác thực' : 'Chưa xác thực' }}
                            </span>
                        </div>
                        <div class="info-row">
                            <strong>SĐT xác thực:</strong>
                            <span
                                :class="['status-badge', selectedCustomer.phoneNumberConfirmed ? 'active' : 'inactive']">
                                {{ selectedCustomer.phoneNumberConfirmed ? 'Đã xác thực' : 'Chưa xác thực' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useCustomerStore } from '@/stores/userStore'

export default {
    name: 'AccountManagementView',
    setup() {
        const customerStore = useCustomerStore()
        const searchTerm = ref('')
        const showCustomerDetail = ref(false)
        const selectedCustomer = ref(null)

        // Computed
        const getSequentialNumber = computed(() => {
            return (index) => {
                return (customerStore.pageNumber - 1) * customerStore.pageSize + index + 1
            }
        })

        // Methods
        const loadCustomers = async (customQuery = {}) => {
            await customerStore.fetchCustomers(customQuery)
        }

        const handleSearch = () => {
            customerStore.setQuery({
                pageNumber: 1,
                searchTerm: searchTerm.value.trim() || null
            })
            loadCustomers()
        }

        const clearSearch = () => {
            searchTerm.value = ''
            customerStore.setQuery({
                pageNumber: 1,
                searchTerm: null
            })
            loadCustomers()
        }

        const goToPage = (page) => {
            if (page >= 1 && page <= customerStore.totalPages) {
                customerStore.setQuery({ pageNumber: page })
                loadCustomers()
            }
        }

        const viewCustomer = (customer) => {
            selectedCustomer.value = customer
            showCustomerDetail.value = true
        }

        const closeModal = () => {
            showCustomerDetail.value = false
            selectedCustomer.value = null
        }

        // Lifecycle
        onMounted(() => {
            loadCustomers()
        })

        return {
            customerStore,
            searchTerm,
            showCustomerDetail,
            selectedCustomer,
            getSequentialNumber,
            loadCustomers,
            handleSearch,
            clearSearch,
            goToPage,
            viewCustomer,
            closeModal
        }
    }
}
</script>

<style scoped>
.account-management {
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

.search-btn,
.clear-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
}

.search-btn {
    background-color: #007bff;
    color: white;
}

.search-btn:hover {
    background-color: #0056b3;
}

.clear-btn {
    background-color: #6c757d;
    color: white;
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

/* Table */
.table-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin-bottom: 20px;
}

.customer-table {
    width: 100%;
    border-collapse: collapse;
}

.customer-table th,
.customer-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
}

.customer-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
}

.customer-table tr:hover {
    background-color: #f5f5f5;
}

.no-data {
    text-align: center;
    color: #6c757d;
    font-style: italic;
}

/* Status Badge */
.status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.status-badge.small {
    padding: 2px 6px;
    font-size: 10px;
    margin: 1px;
}

.status-badge.active {
    background-color: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background-color: #f8d7da;
    color: #721c24;
}

.verification-status {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 5px;
}

.btn {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
}

.btn-info {
    background-color: #17a2b8;
    color: white;
}

.btn-info:hover {
    background-color: #138496;
}

.btn-warning {
    background-color: #ffc107;
    color: #212529;
}

.btn-warning:hover {
    background-color: #e0a800;
}

.btn-success {
    background-color: #28a745;
    color: white;
}

.btn-success:hover {
    background-color: #218838;
}

/* Pagination */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.customer-info {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.info-row {
    display: flex;
    gap: 10px;
}

.info-row strong {
    min-width: 120px;
    color: #495057;
}

/* Responsive */
@media (max-width: 768px) {
    .customer-table {
        font-size: 12px;
    }

    .customer-table th,
    .customer-table td {
        padding: 8px 10px;
    }

    .search-box {
        flex-direction: column;
        align-items: stretch;
    }

    .pagination {
        flex-direction: column;
        gap: 10px;
    }
}
</style>

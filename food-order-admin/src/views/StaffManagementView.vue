<template>
    <div class="staff-management">
        <div class="header">
            <h2>Quản lý nhân viên</h2>
            <button @click="showAddModal = true" class="btn btn-primary">
                <i class="fas fa-plus"></i> Thêm nhân viên
            </button>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-section">
            <div class="search-box">
                <input v-model="searchTerm" type="text" placeholder="Tìm kiếm theo email, tên hoặc số điện thoại..."
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
        <div v-if="userStore.loading" class="loading">
            <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>

        <!-- Error State -->
        <div v-if="userStore.error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ userStore.error }}
        </div>

        <!-- Staff List Table -->
        <div v-if="!userStore.loading && !userStore.error" class="table-container">
            <table class="staff-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Tên đăng nhập</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="userStore.staff.length === 0">
                        <td colspan="6" class="no-data">Không có dữ liệu</td>
                    </tr>
                    <tr v-for="(staff, index) in userStore.staff" :key="staff.id">
                        <td>{{ getSequentialNumber(index) }}</td>
                        <td>{{ staff.fullName }}</td>
                        <td>{{ staff.email }}</td>
                        <td>{{ staff.phoneNumber }}</td>
                        <td>{{ staff.userName }}</td>
                        <td>
                            <div class="action-buttons">
                                <button @click="viewStaff(staff)" class="btn btn-info" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button @click="editStaff(staff)" class="btn btn-warning" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="confirmDelete(staff)" class="btn btn-danger" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1" class="pagination-btn">
                <i class="fas fa-chevron-left"></i>
            </button>

            <span class="pagination-info">
                Trang {{ currentPage }} / {{ totalPages }}
                ({{ userStore.totalStaff }} nhân viên)
            </span>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= totalPages" class="pagination-btn">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>

        <!-- Add Staff Modal -->
        <AddStaffModal v-if="showAddModal" @close="showAddModal = false" @success="handleAddSuccess" />

        <!-- Edit Staff Modal -->
        <EditStaffModal v-if="showEditModal" :staff="selectedStaff" @close="showEditModal = false"
            @success="handleEditSuccess" />

        <!-- View Staff Modal -->
        <ViewStaffModal v-if="showViewModal" :staff="selectedStaff" @close="showViewModal = false" />

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-content delete-modal" @click.stop>
                <div class="modal-header">
                    <h3>Xác nhận xóa</h3>
                    <button @click="closeDeleteModal" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{{ selectedStaff?.fullName }}</strong>?</p>
                    <p class="warning">Hành động này không thể hoàn tác!</p>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteModal" class="btn btn-secondary">Hủy</button>
                    <button @click="handleDelete" class="btn btn-danger" :disabled="deleting">
                        <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
                        {{ deleting ? 'Đang xóa...' : 'Xóa' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/staffStore'
import AddStaffModal from '@/components/staffcomponent/AddStaffModal.vue'
import EditStaffModal from '@/components/staffcomponent/EditStaffModal.vue'
import ViewStaffModal from '@/components/staffcomponent/ViewStaffModal.vue'

export default {
    name: 'StaffManagementView',
    components: {
        AddStaffModal,
        EditStaffModal,
        ViewStaffModal
    },
    setup() {
        const userStore = useUserStore()
        const searchTerm = ref('')
        const showAddModal = ref(false)
        const showEditModal = ref(false)
        const showViewModal = ref(false)
        const showDeleteModal = ref(false)
        const selectedStaff = ref(null)
        const deleting = ref(false)

        // Computed
        const currentPage = computed(() => userStore.staffFilters.pageNumber)
        const totalPages = computed(() => Math.ceil(userStore.totalStaff / userStore.staffFilters.pageSize))

        const getSequentialNumber = computed(() => {
            return (index) => {
                return (userStore.staffFilters.pageNumber - 1) * userStore.staffFilters.pageSize + index + 1
            }
        })

        // Methods
        const loadStaff = async (customParams = {}) => {
            await userStore.fetchStaff(customParams)
        }

        const handleSearch = () => {
            userStore.staffFilters.pageNumber = 1
            userStore.staffFilters.searchTerm = searchTerm.value.trim() || ''
            loadStaff()
        }

        const clearSearch = () => {
            searchTerm.value = ''
            userStore.staffFilters.pageNumber = 1
            userStore.staffFilters.searchTerm = ''
            loadStaff()
        }

        const goToPage = (page) => {
            if (page >= 1 && page <= totalPages.value) {
                userStore.staffFilters.pageNumber = page
                loadStaff()
            }
        }

        const viewStaff = (staff) => {
            selectedStaff.value = staff
            showViewModal.value = true
        }

        const editStaff = (staff) => {
            selectedStaff.value = staff
            showEditModal.value = true
        }

        const confirmDelete = (staff) => {
            selectedStaff.value = staff
            showDeleteModal.value = true
        }

        const closeDeleteModal = () => {
            showDeleteModal.value = false
            selectedStaff.value = null
        }

        const handleDelete = async () => {
            if (!selectedStaff.value) return

            deleting.value = true
            try {
                await userStore.removeStaff(selectedStaff.value.id)
                closeDeleteModal()
                // Reload current page
                await loadStaff()
            } catch (error) {
                console.error('Error deleting staff:', error)
                alert('Có lỗi xảy ra khi xóa nhân viên: ' + (error.message || 'Unknown error'))
            } finally {
                deleting.value = false
            }
        }

        const handleAddSuccess = () => {
            showAddModal.value = false
            loadStaff() // Reload to see new staff
        }

        const handleEditSuccess = () => {
            showEditModal.value = false
            loadStaff() // Reload to see updated staff
        }

        // Lifecycle
        onMounted(() => {
            loadStaff()
        })

        return {
            userStore,
            searchTerm,
            showAddModal,
            showEditModal,
            showViewModal,
            showDeleteModal,
            selectedStaff,
            deleting,
            currentPage,
            totalPages,
            getSequentialNumber,
            loadStaff,
            handleSearch,
            clearSearch,
            goToPage,
            viewStaff,
            editStaff,
            confirmDelete,
            closeDeleteModal,
            handleDelete,
            handleAddSuccess,
            handleEditSuccess
        }
    }
}
</script>

<style scoped>
.staff-management {
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.header h2 {
    margin: 0;
    color: #333;
}

.search-section {
    margin-bottom: 20px;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 500px;
}

.search-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.search-btn,
.clear-btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
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

.loading,
.error {
    text-align: center;
    padding: 20px;
    margin: 20px 0;
}

.loading {
    color: #007bff;
}

.error {
    color: #dc3545;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

.table-container {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.staff-table {
    width: 100%;
    border-collapse: collapse;
}

.staff-table th,
.staff-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.staff-table th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
}

.staff-table tbody tr:hover {
    background-color: #f8f9fa;
}

.no-data {
    text-align: center;
    color: #6c757d;
    font-style: italic;
}

.role-badge,
.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
}

.role-badge.admin {
    background-color: #dc3545;
    color: white;
}

.role-badge.manager {
    background-color: #fd7e14;
    color: white;
}

.role-badge.staff {
    background-color: #20c997;
    color: white;
}

.role-badge.default {
    background-color: #6c757d;
    color: white;
}

.status-badge.active {
    background-color: #d1ecf1;
    color: #0c5460;
}

.status-badge.inactive {
    background-color: #f8d7da;
    color: #721c24;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
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

.btn-danger {
    background-color: #dc3545;
    color: white;
}

.btn-danger:hover {
    background-color: #c82333;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #545b62;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
}

.pagination-btn {
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #007bff;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    font-weight: 500;
    color: #333;
}

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
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
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
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
}

.close-btn:hover {
    background-color: #f8f9fa;
    color: #333;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #eee;
}

.delete-modal .modal-body {
    text-align: center;
}

.delete-modal .warning {
    color: #dc3545;
    font-weight: 500;
    margin-top: 10px;
}
</style>
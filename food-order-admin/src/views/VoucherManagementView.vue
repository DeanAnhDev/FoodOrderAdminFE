<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-800">Quản lý Voucher</h1>
            <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                + Thêm Voucher
            </button>
        </div>

        <!-- Bộ lọc -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            <input v-model="filters.code" type="text" placeholder="Mã voucher..."
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200" />

            <select v-model="filters.isActive"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Ngừng hoạt động</option>
            </select>

            <input v-model="filters.startDateFrom" type="date"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
            <input v-model="filters.endDateTo" type="date"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm" />

            <select v-model="filters.isOutOfStock"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Kho</option>
                <option value="false">Còn</option>
                <option value="true">Hết</option>
            </select>
        </div>

        <!-- Nút tìm kiếm -->
        <div class="mb-6 flex gap-2">
            <button @click="search"
                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow text-sm font-medium">
                Tìm kiếm
            </button>
            <button @click="resetFilters"
                class="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg shadow text-sm font-medium">
                Reset
            </button>
        </div>

        <!-- Bảng danh sách -->
        <div class="overflow-x-auto rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200 bg-white">
                <thead class="bg-gray-50">
                    <tr class="text-gray-600 text-sm font-medium text-left">
                        <th class="px-6 py-3">Mã</th>
                        <th class="px-6 py-3">Loại</th>
                        <th class="px-6 py-3">Số lượng</th>
                        <th class="px-6 py-3">Giảm</th>
                        <th class="px-6 py-3">Đơn tối thiểu</th>
                        <th class="px-6 py-3">Ngày bắt đầu</th>
                        <th class="px-6 py-3">Ngày hết hạn</th>
                        <th class="px-6 py-3">Trạng thái</th>
                        <th class="px-6 py-3 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                    <tr v-for="voucher in voucherStore.vouchers" :key="voucher.voucherId"
                        class="hover:bg-gray-50 transition">
                        <td class="px-6 py-3 font-semibold text-gray-800">
                            {{ voucher.code }}
                        </td>
                        <td class="px-6 py-3">{{ voucher.type }}</td>
                        <td class="px-6 py-3">{{ voucher.quantity }}</td>
                        <td class="px-6 py-3">
                            {{ formatPrice(voucher.discountAmount) }}
                        </td>
                        <td class="px-6 py-3">
                            {{ formatPrice(voucher.minOrderPrice) }}
                        </td>
                        <td class="px-6 py-3">{{ formatDate(voucher.startDate) }}</td>
                        <td class="px-6 py-3">{{ formatDate(voucher.endDate) }}</td>
                        <td class="px-6 py-3">
                            <span :class="voucher.isActive ? 'text-green-600 font-medium' : 'text-gray-500'">
                                {{ voucher.isActive ? "Hoạt động" : "Ngừng" }}
                            </span>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <div class="flex justify-center gap-2">
                                <button @click="openDetail(voucher)"
                                    class="text-blue-500 hover:text-blue-700 transition" title="Xem">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button @click="openEdit(voucher)"
                                    class="text-yellow-500 hover:text-yellow-600 transition" title="Sửa">
                                    <i class="fa-solid fa-pen-to-square"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Phân trang -->
        <div class="flex justify-end items-center mt-4 gap-4">
            <button @click="prevPage" :disabled="voucherStore.pagination.page <= 1"
                class="px-3 py-1 border rounded disabled:opacity-50">
                Trước
            </button>
            <span>
                Trang {{ voucherStore.pagination.page }} /
                {{ voucherStore.pagination.totalPages }}
            </span>
            <button @click="nextPage" :disabled="voucherStore.pagination.page >= voucherStore.pagination.totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50">
                Sau
            </button>
        </div>
    </div>

    <!-- Modals -->
    <VoucherCreatePopup :visible="showAddModal" @close="closeAddModal" @created="reloadVouchers" />
    <VoucherDetailPopup :visible="showDetail" :voucher="selectedVoucher" @close="showDetail = false" />


    <!-- Popup chỉnh sửa -->
    <VoucherEditPopup :visible="showEdit" :voucher="selectedVoucher" @close="showEdit = false"
        @updated="voucherStore.fetchVouchers()" />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"
import VoucherCreatePopup from "@/components/vouchercomponent/VoucherCreatePopup.vue"
import VoucherEditPopup from "@/components/vouchercomponent/VoucherEditPopup.vue"
import VoucherDetailPopup from "@/components/vouchercomponent/VoucherDetailPopup.vue"
import { formatPrice, formatDate } from "@/utils/format"

const voucherStore = useVoucherStore()

// State popup
const showAddModal = ref(false)
const showDetail = ref(false)
const showEdit = ref(false)
const selectedVoucher = ref(null)

// Bộ lọc
const filters = ref({
    code: "",
    isActive: "",
    startDateFrom: "",
    endDateTo: "",
    isOutOfStock: "",
})

// Reset filters
const resetFilters = () => {
    filters.value = {
        code: "",
        isActive: "",
        startDateFrom: "",
        endDateTo: "",
        isOutOfStock: "",
    }
    reloadVouchers()
}

// Search
const search = () => {
    voucherStore.filters = { ...filters.value }
    reloadVouchers()
}

// Load data
const reloadVouchers = () => voucherStore.fetchVouchers()
onMounted(reloadVouchers)

// Popup thêm
const openAddModal = () => (showAddModal.value = true)
const closeAddModal = () => (showAddModal.value = false)

// Popup sửa
const openDetail = (voucher) => {
    selectedVoucher.value = { ...voucher }
    showDetail.value = true
}

const openEdit = (voucher) => {
    selectedVoucher.value = { ...voucher }
    showEdit.value = true
}

// Pagination
const prevPage = () => {
    if (voucherStore.pagination.page > 1) {
        voucherStore.setPage(voucherStore.pagination.page - 1)
        voucherStore.fetchVouchers()
    }
}

const nextPage = () => {
    if (voucherStore.pagination.page < voucherStore.pagination.totalPages) {
        voucherStore.setPage(voucherStore.pagination.page + 1)
        voucherStore.fetchVouchers()
    }
}
</script>

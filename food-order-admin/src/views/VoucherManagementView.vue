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
            <!-- Mã voucher -->
            <div>
                <label class="block text-sm font-medium mb-1">Mã voucher</label>
                <input v-model="filters.code" type="text" placeholder="Nhập mã voucher"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200" />
            </div>

            <!-- Trạng thái hoạt động -->
            <div>
                <label class="block text-sm font-medium mb-1">Trạng thái</label>
                <select v-model="filters.isActive"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200">
                    <option :value="null">Tất cả trạng thái</option>
                    <option :value="true">Đang hoạt động</option>
                    <option :value="false">Ngừng hoạt động</option>
                </select>
            </div>

            <!-- Loại voucher -->
            <div>
                <label class="block text-sm font-medium mb-1">Loại voucher</label>
                <select v-model="filters.type"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200">
                    <option :value="null">Tất cả loại</option>
                    <option :value="0">Giảm theo %</option>
                    <option :value="1">Giảm theo số tiền</option>
                </select>
            </div>

            <!-- Ngày bắt đầu -->
            <div>
                <label class="block text-sm font-medium mb-1">Ngày bắt đầu từ</label>
                <input v-model="filters.startDateFrom" type="date" class="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Ngày bắt đầu đến</label>
                <input v-model="filters.startDateTo" type="date" class="w-full px-4 py-2 border rounded-md" />
            </div>

            <!-- Ngày kết thúc -->
            <div>
                <label class="block text-sm font-medium mb-1">Ngày kết thúc từ</label>
                <input v-model="filters.endDateFrom" type="date" class="w-full px-4 py-2 border rounded-md" />
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Ngày kết thúc đến</label>
                <input v-model="filters.endDateTo" type="date" class="w-full px-4 py-2 border rounded-md" />
            </div>

            <!-- Trạng thái kho -->
            <div>
                <label class="block text-sm font-medium mb-1">Kho</label>
                <select v-model="filters.isOutOfStock"
                    class="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200">
                    <option :value="null">Tất cả kho</option>
                    <option :value="false">Còn hàng</option>
                    <option :value="true">Hết hàng</option>
                </select>
            </div>

            <!-- Đơn tối thiểu -->
            <div>
                <label class="block text-sm font-medium mb-1">Đơn tối thiểu (VNĐ)</label>
                <input v-model.number="filters.minOrderAmount" type="number" min="0" placeholder="Nhập số tiền"
                    class="w-full px-4 py-2 border rounded-md" />
            </div>
        </div>


        <!-- Nút tìm kiếm & reset -->
        <div class="mb-6 flex gap-2">
            <button @click="applyFilter"
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
                        <th class="px-6 py-3">Giảm tối đa</th>
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
                        <td class="px-6 py-3 font-semibold text-gray-800">{{ voucher.code }}</td>
                        <td class="px-6 py-3">
                            {{ voucher.type === 'Amount' ? "VNĐ" : voucher.type === 'Percentage' ? "% giảm" : "N/A" }}
                        </td>
                        <td class="px-6 py-3">{{ voucher.quantity }}</td>
                        <td class="px-6 py-3">
                            {{ voucher.type === 'Amount'
                                ? formatPrice(voucher.discountAmount)
                                : voucher.type === 'Percentage'
                                    ? voucher.discountAmount + "%"
                                    : "N/A" }}
                        </td>
                        <td class="px-6 py-3">{{ formatPrice(voucher.maxDiscountPrice) }}</td>
                        <td class="px-6 py-3">{{ formatPrice(voucher.minOrderPrice) }}</td>
                        <td class="px-6 py-3">{{ formatDate(voucher.startDate) }}</td>
                        <td class="px-6 py-3">{{ formatDate(voucher.endDate) }}</td>
                        <td class="px-6 py-3">
                            <span :class="voucher.isActive ? 'text-green-600 font-medium' : 'text-gray-500'">
                                {{ voucher.isActive ? "Hoạt động" : "Ngừng" }}
                            </span>
                        </td>
                        <td class="px-6 py-3 text-center">
                            <div class="flex justify-center gap-2">
                                <button @click="openDetail(voucher)" class="text-blue-500 hover:text-blue-700"
                                    title="Xem">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button @click="openEdit(voucher)" class="text-yellow-500 hover:text-yellow-600"
                                    title="Sửa">
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
                class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <span>Trang {{ voucherStore.pagination.page }} / {{ voucherStore.pagination.totalPages }}</span>
            <button @click="nextPage" :disabled="voucherStore.pagination.page >= voucherStore.pagination.totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
        </div>

        <!-- Modals -->
        <VoucherCreatePopup :visible="showAddModal" @close="closeAddModal" @created="reloadVouchers" />
        <VoucherDetailPopup :visible="showDetail" :voucher="selectedVoucher" @close="showDetail = false" />
        <VoucherEditPopup :visible="showEdit" :voucher="selectedVoucher" @close="showEdit = false"
            @updated="reloadVouchers" />
    </div>
</template>

<script setup>
import { ref } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"
import { formatPrice, formatDate } from "@/utils/format"
import VoucherCreatePopup from "@/components/vouchercomponent/VoucherCreatePopup.vue"
import VoucherEditPopup from "@/components/vouchercomponent/VoucherEditPopup.vue"
import VoucherDetailPopup from "@/components/vouchercomponent/VoucherDetailPopup.vue"

const voucherStore = useVoucherStore()

// Popup state
const showAddModal = ref(false)
const showDetail = ref(false)
const showEdit = ref(false)
const selectedVoucher = ref(null)

// Bộ lọc đầy đủ 9 trường
const filters = ref({
    code: '',
    isActive: null,
    type: null,
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
    isOutOfStock: null,
    minOrderAmount: null,
})

// Ngày hiện tại khóa ngày trong quá khứ
const today = new Date()
today.setHours(0, 0, 0, 0)
const todayStr = today.toISOString().split('T')[0]

// Apply filter với validate ngày
const applyFilter = () => {
    if (filters.value.startDateFrom && filters.value.startDateTo &&
        new Date(filters.value.startDateFrom) > new Date(filters.value.startDateTo)) {
        alert("Ngày bắt đầu từ phải ≤ ngày bắt đầu đến")
        return
    }
    if (filters.value.endDateFrom && filters.value.endDateTo &&
        new Date(filters.value.endDateFrom) > new Date(filters.value.endDateTo)) {
        alert("Ngày kết thúc từ phải ≤ ngày kết thúc đến")
        return
    }

    voucherStore.filters = { ...filters.value }
    reloadVouchers()
}

// Reset bộ lọc
const resetFilters = () => {
    filters.value = {
        code: '',
        isActive: null,
        type: null,
        startDateFrom: null,
        startDateTo: null,
        endDateFrom: null,
        endDateTo: null,
        isOutOfStock: null,
        minOrderAmount: null,
    }
    reloadVouchers()
}

// Load vouchers
const reloadVouchers = () => voucherStore.fetchVouchers()

// Popup handlers
const openAddModal = () => showAddModal.value = true
const closeAddModal = () => showAddModal.value = false

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
        reloadVouchers()
    }
}
const nextPage = () => {
    if (voucherStore.pagination.page < voucherStore.pagination.totalPages) {
        voucherStore.setPage(voucherStore.pagination.page + 1)
        reloadVouchers()
    }
}

// On mounted
reloadVouchers()
</script>

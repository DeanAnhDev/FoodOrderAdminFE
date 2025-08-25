<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Danh sách Voucher</h1>

        <!-- Thanh công cụ -->
        <div class="flex justify-between mb-4">
            <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded shadow">
                + Thêm Voucher
            </button>
        </div>

        <!-- Bảng danh sách -->
        <table class="w-full border-collapse border text-sm">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border p-2">Mã</th>
                    <th class="border p-2">Mô tả</th>
                    <th class="border p-2">Giảm</th>
                    <th class="border p-2">Ngày bắt đầu</th>
                    <th class="border p-2">Ngày kết thúc</th>
                    <th class="border p-2">Số lượng</th>
                    <th class="border p-2">Tối thiểu đơn</th>
                    <th class="border p-2">Trạng thái</th>
                    <th class="border p-2">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="voucher in voucherStore.vouchers.items" :key="voucher.voucherId">
                    <td class="border p-2">{{ voucher.code }}</td>
                    <td class="border p-2">{{ voucher.description || "-" }}</td>
                    <td class="border p-2">
                        <span v-if="voucher.discountPercent && voucher.discountPercent > 0">
                            -{{ voucher.discountPercent }}%
                            <span v-if="voucher.maxDiscountAmount">
                                (Tối đa {{ formatCurrency(voucher.maxDiscountAmount) }})
                            </span>
                        </span>
                        <span v-else-if="voucher.discountAmount">
                            -{{ formatCurrency(voucher.discountAmount) }}
                        </span>
                        <span v-else>-</span>
                    </td>
                    <td class="border p-2">{{ formatDate(voucher.startDate) }}</td>
                    <td class="border p-2">{{ formatDate(voucher.endDate) }}</td>
                    <td class="border p-2">{{ voucher.quantity }}</td>
                    <td class="border p-2">{{ formatCurrency(voucher.minOrderAmount) }}</td>
                    <td class="border p-2">
                        <span :class="voucher.isActive ? 'text-green-600' : 'text-red-600'">
                            {{ voucher.isActive ? "Đang hoạt động" : "Ngưng" }}
                        </span>
                    </td>
                    <td class="border p-2 space-x-2">
                        <button @click="openEditModal(voucher)" class="px-2 py-1 bg-blue-600 text-white rounded">
                            Sửa
                        </button>
                        <button @click="deleteVoucher(voucher.voucherId)"
                            class="px-2 py-1 bg-red-600 text-white rounded">
                            Xóa
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Phân trang -->
        <div v-if="voucherStore.vouchers.totalPages > 1" class="mt-4 flex justify-center space-x-2">
            <button v-for="page in voucherStore.vouchers.totalPages" :key="page" @click="changePage(page)" :class="[
                'px-3 py-1 border rounded',
                page === voucherStore.vouchers.pageNumber ? 'bg-blue-600 text-white' : 'bg-white'
            ]">
                {{ page }}
            </button>
        </div>

        <!-- Popup Thêm -->
        <VoucherCreatePopup :visible="showAddModal" @close="closeAddModal" @saved="reloadVouchers" />

        <!-- Popup Sửa -->
        <VoucherEditPopup :visible="showEditModal" :voucher="selectedVoucher" @close="closeEditModal"
            @saved="reloadVouchers" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"
import VoucherCreatePopup from "@/components/vouchercomponent/VoucherCreatePopup.vue"
import VoucherEditPopup from "@/components/vouchercomponent/VoucherEditPopup.vue"

const voucherStore = useVoucherStore()

// State popup
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedVoucher = ref(null)

// Load data
const reloadVouchers = () => voucherStore.fetchVouchers()
onMounted(reloadVouchers)

// Popup thêm
const openAddModal = () => (showAddModal.value = true)
const closeAddModal = () => (showAddModal.value = false)

// Popup sửa
const openEditModal = (voucher) => {
    selectedVoucher.value = voucher
    showEditModal.value = true
}
const closeEditModal = () => {
    showEditModal.value = false
    selectedVoucher.value = null
}

// Xóa
const deleteVoucher = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa voucher này?")) {
        await voucherStore.deleteVoucher(id)
        reloadVouchers()
    }
}

// Phân trang
const changePage = (page) => {
    voucherStore.fetchVouchers(page)
}

// format ngày
const formatDate = (dateStr) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("vi-VN")
}

// format tiền
const formatCurrency = (value) => {
    if (value == null) return "-"
    return value.toLocaleString("vi-VN") + "đ"
}
</script>

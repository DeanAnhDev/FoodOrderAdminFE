<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-800">Quản lý Khuyến Mãi</h1>
            <button @click="openAddModal" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                + Thêm Khuyến Mãi
            </button>
        </div>

        <!-- Bộ lọc -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            <!-- Mã khuyến mãi -->
            <div>
                <label class="block text-sm font-medium mb-1">Mã khuyến mãi</label>
                <input v-model="filters.code" type="text" placeholder="Nhập mã khuyến mãi"
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
                        <th class="px-6 py-3">ID</th>
                        <th class="px-6 py-3">Tên khuyến mãi</th>
                        <th class="px-6 py-3">Giảm giá</th>
                        <th class="px-6 py-3">Loại</th>
                        <th class="px-6 py-3">Trạng thái</th>
                        <th class="px-6 py-3">Ngày bắt đầu</th>
                        <th class="px-6 py-3">Ngày kết thúc</th>
                        <th class="px-6 py-3">Số món</th>
                        <th class="px-6 py-3">Số combo</th>
                        <th class="px-6 py-3 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                    <tr v-for="promotion in promotionStore.promotions" :key="promotion.promotionId"
                        class="hover:bg-gray-50 transition">
                        <td class="px-6 py-3 font-semibold text-gray-800">{{ promotion.promotionId }}</td>
                        <td class="px-6 py-3">{{ promotion.promotionName }}</td>
                        <td class="px-6 py-3">{{ formatPrice(promotion.discountAmount) }}</td>
                        <td class="px-6 py-3">{{ promotion.type }}</td>
                        <td class="px-6 py-3">
                            <span :class="promotion.isActive ? 'text-green-600 font-medium' : 'text-gray-500'">
                                {{ promotion.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                            </span>
                        </td>
                        <td class="px-6 py-3">{{ formatDate(promotion.startDate) }}</td>
                        <td class="px-6 py-3">{{ formatDate(promotion.endDate) }}</td>
                        <td class="px-6 py-3">{{ promotion.foods.length }}</td>
                        <td class="px-6 py-3">{{ promotion.combos.length }}</td>
                        <td class="px-6 py-3 text-center">
                            <div class="flex justify-center gap-2">
                                <button @click="openDetail(promotion)"
                                    class="px-2 py-1 text-blue-600 hover:underline">Xem</button>
                                <button @click="openEdit(promotion)"
                                    class="px-2 py-1 text-yellow-600 hover:underline">Sửa</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Phân trang -->
        <div class="flex justify-end items-center mt-4 gap-4">
            <button @click="prevPage" :disabled="promotionStore.pagination.page <= 1"
                class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
            <span>Trang {{ promotionStore.pagination.page }} / {{ promotionStore.pagination.totalPages }}</span>
            <button @click="nextPage" :disabled="promotionStore.pagination.page >= promotionStore.pagination.totalPages"
                class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
        </div>

        <!-- Modals -->
        <PromotionCreatePopup :visible="showAddModal" @close="closeAddModal" @created="reloadPromotions" />
        <PromotionDetailPopup :visible="showDetail" :promotion="selectedPromotion" @close="showDetail = false" />
        <PromotionEditPopup :visible="showEdit" :promotion="selectedPromotion" @close="showEdit = false"
            @updated="reloadPromotions" />
    </div>
</template>

<script setup>
import { ref } from "vue"
import { usePromotionStore } from "@/stores/promotionStore"
import { formatPrice, formatDate } from "@/utils/format"
import PromotionCreatePopup from "@/components/promotioncomponent/PromotionCreatePopup.vue"
import PromotionEditPopup from "@/components/promotioncomponent/PromotionEditPopup.vue"
import PromotionDetailPopup from "@/components/promotioncomponent/PromotionDetailPopup.vue"

const promotionStore = usePromotionStore()

// Popup state
const showAddModal = ref(false)
const showDetail = ref(false)
const showEdit = ref(false)
const selectedPromotion = ref(null)

// Bộ lọc
const filters = ref({
    code: '',
    isActive: null,
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
    minOrderAmount: null,
})

// Ánh xạ filters sang store
const applyFilter = () => {
    // Validate ngày
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

    // Chuyển đổi sang các trường store đang dùng
    promotionStore.setFilters({
        name: filters.value.code,
        status: filters.value.isActive,
        // Có thể bổ sung các trường khác nếu service hỗ trợ
    })
    promotionStore.setPage(1)
    reloadPromotions()
}

// Reset bộ lọc
const resetFilters = () => {
    filters.value = {
        code: '',
        isActive: null,
        startDateFrom: null,
        startDateTo: null,
        endDateFrom: null,
        endDateTo: null,
        minOrderAmount: null,
    }
    promotionStore.setFilters({
        name: '',
        status: null,
    })
    promotionStore.setPage(1)
    reloadPromotions()
}

// Load promotions
const reloadPromotions = () => promotionStore.fetchPromotions()

// Popup handlers
const openAddModal = () => showAddModal.value = true
const closeAddModal = () => showAddModal.value = false

const openDetail = (promotion) => {
    selectedPromotion.value = { ...promotion }
    showDetail.value = true
}

const openEdit = (promotion) => {
    selectedPromotion.value = { ...promotion }
    showEdit.value = true
}

// Pagination
const prevPage = () => {
    if (promotionStore.pagination.page > 1) {
        promotionStore.setPage(promotionStore.pagination.page - 1)
        reloadPromotions()
    }
}
const nextPage = () => {
    if (promotionStore.pagination.page < promotionStore.pagination.totalPages) {
        promotionStore.setPage(promotionStore.pagination.page + 1)
        reloadPromotions()
    }
}

// On mounted
reloadPromotions()
</script>
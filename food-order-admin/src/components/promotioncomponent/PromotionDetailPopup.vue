<script setup>
import { ref, watch } from "vue"

const props = defineProps({
    visible: Boolean,
    promotion: Object
})
const emit = defineEmits(["close"])

const close = () => {
    emit("close")
}

const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("vi-VN")
}
</script>

<template>
    <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Chi tiết khuyến mãi</h2>
                <button @click="close" class="text-gray-500 hover:text-gray-700">✖</button>
            </div>

            <div v-if="promotion" class="space-y-4">
                <!-- Thông tin cơ bản -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Tên khuyến mãi</p>
                        <p class="font-medium">{{ promotion.promotionName }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Loại</p>
                        <p class="font-medium">
                            {{ promotion.type === 'Amount' ? 'Theo số tiền (VNĐ)' : 'Theo phần trăm (%)' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Giá trị giảm</p>
                        <p class="font-medium">
                            {{ promotion.type === 'Amount' ? promotion.discountAmount.toLocaleString() + ' đ' :
                                promotion.discountAmount + '%' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Trạng thái</p>
                        <span
                            :class="promotion.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                            {{ promotion.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                        </span>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Ngày bắt đầu</p>
                        <p class="font-medium">{{ formatDate(promotion.startDate) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Ngày kết thúc</p>
                        <p class="font-medium">{{ formatDate(promotion.endDate) }}</p>
                    </div>
                </div>

                <!-- Danh sách món ăn -->
                <!-- Danh sách món ăn -->
                <div v-if="promotion.foods?.length">
                    <h3 class="text-lg font-semibold mb-3">Món ăn áp dụng</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div v-for="food in promotion.foods" :key="food.foodId"
                            class="bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition flex flex-col">
                            <!-- Hình ảnh + badge -->
                            <div class="relative w-full h-36">
                                <img :src="food.images?.thumbnailUrl || food.images?.url" alt=""
                                    class="w-full h-full object-cover" />
                                <span
                                    class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
                                    -{{ promotion.type === 'Percentage'
                                        ? promotion.discountAmount + '%'
                                        : promotion.discountAmount.toLocaleString() + 'đ'
                                    }}
                                </span>
                            </div>

                            <!-- Nội dung -->
                            <div class="flex-1 p-3 flex flex-col justify-between">
                                <p class="font-semibold text-gray-800 text-sm line-clamp-1">
                                    {{ food.foodName }}
                                </p>

                                <div class="mt-2">
                                    <!-- Giá gốc -->
                                    <p class="text-gray-400 line-through text-xs">
                                        {{ food.price.toLocaleString() }} đ
                                    </p>
                                    <!-- Giá sau giảm -->
                                    <p class="text-red-600 font-bold text-base">
                                        {{
                                            promotion.type === 'Percentage'
                                                ? (food.price * (1 - promotion.discountAmount / 100)).toLocaleString()
                                                : Math.max(0, (food.price - promotion.discountAmount)).toLocaleString()
                                        }} đ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Danh sách combo -->
                <div v-if="promotion.combos?.length" class="mt-8">
                    <h3 class="text-lg font-semibold mb-3">Combo áp dụng</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div v-for="combo in promotion.combos" :key="combo.comboId"
                            class="bg-white border rounded-xl overflow-hidden shadow hover:shadow-lg transition flex flex-col">
                            <!-- Hình ảnh + badge -->
                            <div class="relative w-full h-36">
                                <img :src="combo.images?.thumbnailUrl || combo.images?.url" alt=""
                                    class="w-full h-full object-cover" />
                                <span
                                    class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
                                    -{{ promotion.type === 'Percentage'
                                        ? promotion.discountAmount + '%'
                                        : promotion.discountAmount.toLocaleString() + 'đ'
                                    }}
                                </span>
                            </div>

                            <!-- Nội dung -->
                            <div class="flex-1 p-3 flex flex-col justify-between">
                                <p class="font-semibold text-gray-800 text-sm line-clamp-1">
                                    {{ combo.comboName }}
                                </p>

                                <div class="mt-2">
                                    <!-- Giá gốc -->
                                    <p class="text-gray-400 line-through text-xs">
                                        {{ combo.price.toLocaleString() }} đ
                                    </p>
                                    <!-- Giá sau giảm -->
                                    <p class="text-red-600 font-bold text-base">
                                        {{
                                            promotion.type === 'Percentage'
                                                ? (combo.price * (1 - promotion.discountAmount / 100)).toLocaleString()
                                                : Math.max(0, (combo.price - promotion.discountAmount)).toLocaleString()
                                        }} đ
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
            <!-- Actions -->
            <div class="flex justify-end mt-6">
                <button @click="close" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Đóng</button>
            </div>
        </div>
    </div>
</template>

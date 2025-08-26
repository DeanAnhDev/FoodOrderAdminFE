<template>
    <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-xl animate-fade-in">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Chi tiết Voucher</h2>
                <button @click="close" class="text-gray-500 hover:text-gray-800">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>

            <!-- Body -->
            <div class="space-y-3 text-sm text-gray-700">
                <div class="flex justify-between">
                    <span class="font-medium">Mã voucher:</span>
                    <span>{{ voucher.code }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Giá trị giảm:</span>
                    <span>{{ formatPrice(voucher.discountAmount) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Loại:</span>
                    <span>
                        <span v-if="voucher.type === 'Percent'">Giảm theo %</span>
                        <span v-else>Giảm theo số tiền</span>
                    </span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Số lượng:</span>
                    <span>{{ voucher.quantity }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Đơn tối thiểu:</span>
                    <span>{{ formatPrice(voucher.minOrderPrice) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Giảm tối đa:</span>
                    <span>{{ formatPrice(voucher.maxDiscountPrice) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Ngày bắt đầu:</span>
                    <span>{{ formatDate(voucher.startDate) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Ngày kết thúc:</span>
                    <span>{{ formatDate(voucher.endDate) }}</span>
                </div>

                <div class="flex justify-between">
                    <span class="font-medium">Trạng thái:</span>
                    <span :class="voucher.isActive ? 'text-green-600' : 'text-red-600'">
                        {{ voucher.isActive ? 'Đang hoạt động' : 'Ngưng' }}
                    </span>
                </div>
            </div>

            <!-- Footer -->
            <div class="mt-6 text-right">
                <button @click="close" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded">
                    Đóng
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatPrice, formatDate } from "@/utils/format"

const props = defineProps({
    visible: Boolean,
    voucher: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(["close"])

const close = () => {
    emit("close")
}
</script>

<style scoped>
@keyframes fade-in {
    0% {
        transform: scale(0.95);
        opacity: 0;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-fade-in {
    animation: fade-in 0.2s ease-out;
}
</style>

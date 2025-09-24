<template>
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <!-- Success Icon -->
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check-circle text-4xl text-green-500"></i>
            </div>

            <!-- Success Message -->
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p class="text-gray-600 mb-6">
                Đơn hàng của bạn đã được thanh toán thành công qua VNPay.
            </p>

            <!-- Order Info -->
            <div v-if="orderInfo" class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Mã giao dịch:</span>
                    <span class="font-medium">{{ orderInfo.transactionId || 'N/A' }}</span>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3">
                <button @click="goToPOS"
                    class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
                    <i class="fas fa-arrow-left mr-2"></i>
                    Quay lại POS
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const orderInfo = ref(null)

const formatAmount = (amount) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
        return new Date(dateString).toLocaleString('vi-VN')
    } catch {
        return dateString
    }
}

const goToPOS = () => {
    // Redirect về POS với tham số để reload temporary carts
    router.push('/pos?reload=true')
}

const printReceipt = () => {
    // TODO: Implement receipt printing
    alert('Tính năng in hóa đơn sẽ được triển khai sau')
}

onMounted(() => {
    // Extract payment info from URL parameters
    const params = route.query
    if (params.token) {
        // Parse VNPay response parameters
        orderInfo.value = {
            transactionId: params.vnp_TransactionNo || params.token,
            amount: params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : null,
            payDate: params.vnp_PayDate,
            orderInfo: params.vnp_OrderInfo,
            responseCode: params.vnp_ResponseCode
        }
    }
})
</script>
<template>
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <!-- Failed Icon -->
            <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-times-circle text-4xl text-red-500"></i>
            </div>

            <!-- Failed Message -->
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h1>
            <p class="text-gray-600 mb-6">
                Giao dịch VNPay không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>

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
const errorInfo = ref(null)

const getErrorMessage = (responseCode) => {
    const errorMessages = {
        '24': 'Giao dịch bị hủy',
        '11': 'Thẻ/Tài khoản hết hạn',
        '12': 'Thẻ/Tài khoản bị khóa',
        '13': 'Sai mật khẩu',
        '51': 'Tài khoản không đủ số dư',
        '65': 'Tài khoản vượt quá hạn mức giao dịch',
        '75': 'Ngân hàng bảo trì',
        '79': 'Giao dịch vượt quá số lần cho phép',
        '99': 'Lỗi không xác định'
    }
    return errorMessages[responseCode] || 'Giao dịch không thành công'
}

const goToPOS = () => {
    // Redirect về POS với tham số để reload temporary carts
    router.push('/pos?reload=true')
}

const retryPayment = () => {
    // Go back to POS and suggest retry
    router.push('/pos?retry=true&reload=true')
}

const contactSupport = () => {
    // TODO: Implement contact support feature
    alert('Vui lòng liên hệ hotline: 1900-xxxx để được hỗ trợ')
}

onMounted(() => {
    // Extract error info from URL parameters
    const params = route.query
    if (params.token) {
        // Parse VNPay error response parameters
        errorInfo.value = {
            transactionId: params.vnp_TransactionNo || params.token,
            responseCode: params.vnp_ResponseCode,
            orderInfo: params.vnp_OrderInfo,
            amount: params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : null
        }
    }
})
</script>
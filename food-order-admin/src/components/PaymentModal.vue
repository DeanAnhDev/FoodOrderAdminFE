<template>
    <div class="payment-modal">
        <div class="modal-header">
            <h3 class="text-xl font-bold text-gray-800">Thanh toán đơn hàng</h3>
            <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-xl"></i>
            </button>
        </div>

        <div class="modal-body">
            <!-- Order Summary -->
            <div class="order-summary mb-6">
                <h4 class="font-semibold text-gray-700 mb-3">Tổng quan đơn hàng</h4>
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex justify-between items-center text-lg font-bold">
                        <span>Tổng tiền:</span>
                        <span class="text-blue-600">{{ formatCurrency(orderTotal) }}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Method -->
            <div class="payment-method mb-6">
                <h4 class="font-semibold text-gray-700 mb-3">Phương thức thanh toán</h4>
                <div class="grid grid-cols-3 gap-3">
                    <button v-for="method in paymentMethods" :key="method.value"
                        @click="selectedPaymentMethod = method.value" :class="[
                            'p-4 border-2 rounded-lg transition-colors text-center',
                            selectedPaymentMethod === method.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                        ]">
                        <i :class="method.icon + ' text-2xl mb-2 block'"></i>
                        <span class="text-sm font-medium">{{ method.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Cash Payment Details -->
            <div v-if="selectedPaymentMethod === 'cash'" class="cash-payment mb-6">
                <h4 class="font-semibold text-gray-700 mb-3">Chi tiết thanh toán tiền mặt</h4>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Số tiền khách đưa
                        </label>
                        <input v-model="customerPaid" type="number" :min="orderTotal" step="1000"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="Nhập số tiền khách đưa" />
                    </div>

                    <!-- Quick amount buttons -->
                    <div class="quick-amounts">
                        <p class="text-sm text-gray-600 mb-2">Số tiền gợi ý:</p>
                        <div class="grid grid-cols-4 gap-2">
                            <button v-for="amount in suggestedAmounts" :key="amount" @click="customerPaid = amount"
                                class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                                {{ formatCurrency(amount) }}
                            </button>
                        </div>
                    </div>

                    <!-- Change calculation -->
                    <div v-if="customerPaid && customerPaid >= orderTotal"
                        class="change-info bg-green-50 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-green-800">Tiền thừa:</span>
                            <span class="text-xl font-bold text-green-600">
                                {{ formatCurrency(customerPaid - orderTotal) }}
                            </span>
                        </div>
                    </div>

                    <div v-else-if="customerPaid && customerPaid < orderTotal"
                        class="change-info bg-red-50 rounded-lg p-4">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-red-800">Còn thiếu:</span>
                            <span class="text-xl font-bold text-red-600">
                                {{ formatCurrency(orderTotal - customerPaid) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Card/Transfer Payment -->
            <div v-else-if="selectedPaymentMethod !== 'cash'" class="other-payment mb-6">
                <div class="bg-blue-50 rounded-lg p-4">
                    <div class="flex items-center">
                        <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                        <span class="text-blue-700">
                            Vui lòng hoàn tất thanh toán qua {{ getPaymentMethodLabel(selectedPaymentMethod) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Customer Info -->
            <div class="customer-info mb-6">
                <h4 class="font-semibold text-gray-700 mb-3">Thông tin khách hàng</h4>
                <input v-model="customerName" type="text" placeholder="Tên khách hàng (tùy chọn)"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
        </div>

        <div class="modal-footer">
            <div class="flex space-x-3">
                <button @click="$emit('close')"
                    class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Hủy
                </button>
                <button @click="processPayment" :disabled="!canProcess" :class="[
                    'flex-1 px-6 py-3 rounded-lg font-medium transition-colors',
                    canProcess
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                ]">
                    <span v-if="processing">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        Đang xử lý...
                    </span>
                    <span v-else>
                        <i class="fas fa-check mr-2"></i>
                        Xác nhận thanh toán
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
    orderTotal: {
        type: Number,
        required: true
    },
    initialPaymentMethod: {
        type: String,
        default: 'cash'
    },
    initialCustomerName: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'confirm'])

// Data
const selectedPaymentMethod = ref(props.initialPaymentMethod)
const customerPaid = ref(0)
const customerName = ref(props.initialCustomerName)
const processing = ref(false)

const paymentMethods = [
    { value: 'cash', label: 'Tiền mặt', icon: 'fas fa-money-bill-wave' },
    { value: 'card', label: 'Thẻ', icon: 'fas fa-credit-card' },
    { value: 'transfer', label: 'Chuyển khoản', icon: 'fas fa-university' }
]

// Computed
const suggestedAmounts = computed(() => {
    const total = props.orderTotal
    const suggestions = []

    // Round up to nearest thousands
    const roundedAmount = Math.ceil(total / 1000) * 1000
    suggestions.push(roundedAmount)

    // Add some common amounts above
    if (roundedAmount < total + 10000) {
        suggestions.push(roundedAmount + 10000)
    }
    if (roundedAmount < total + 20000) {
        suggestions.push(roundedAmount + 20000)
    }
    if (roundedAmount < total + 50000) {
        suggestions.push(roundedAmount + 50000)
    }

    return [...new Set(suggestions)].sort((a, b) => a - b)
})

const canProcess = computed(() => {
    if (selectedPaymentMethod.value === 'cash') {
        return customerPaid.value >= props.orderTotal
    }
    return true
})

// Methods
const getPaymentMethodLabel = (method) => {
    const found = paymentMethods.find(pm => pm.value === method)
    return found ? found.label : method
}

const processPayment = async () => {
    if (!canProcess.value) return

    processing.value = true

    try {
        const paymentData = {
            paymentMethod: selectedPaymentMethod.value,
            customerName: customerName.value,
            customerPaid: selectedPaymentMethod.value === 'cash' ? customerPaid.value : props.orderTotal,
            change: selectedPaymentMethod.value === 'cash' ? customerPaid.value - props.orderTotal : 0
        }

        emit('confirm', paymentData)
    } finally {
        processing.value = false
    }
}

// Watch for payment method changes
watch(selectedPaymentMethod, (newMethod) => {
    if (newMethod !== 'cash') {
        customerPaid.value = props.orderTotal
    } else {
        customerPaid.value = 0
    }
})
</script>

<style scoped>
.payment-modal {
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
}

.modal-footer {
    padding: 24px;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
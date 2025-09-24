<template>
    <div class="receipt-container">
        <!-- Receipt Print Area -->
        <div id="receipt-print" class="receipt-print">
            <div class="receipt-header">
                <h2>{{ restaurantInfo.name }}</h2>
                <p>{{ restaurantInfo.address }}</p>
                <p>{{ restaurantInfo.phone }}</p>
                <div class="divider"></div>
            </div>

            <div class="receipt-info">
                <div class="info-row">
                    <span>Mã đơn hàng:</span>
                    <span>#{{ order.id }}</span>
                </div>
                <div class="info-row">
                    <span>Thời gian:</span>
                    <span>{{ formatDateTime(order.createdAt || new Date()) }}</span>
                </div>
                <div class="info-row">
                    <span>Khách hàng:</span>
                    <span>{{ order.customerName }}</span>
                </div>
                <div class="info-row">
                    <span>Thanh toán:</span>
                    <span>{{ getPaymentMethodText(order.paymentMethod) }}</span>
                </div>
                <div class="divider"></div>
            </div>

            <div class="receipt-items">
                <div class="items-header">
                    <span>Món</span>
                    <span>SL</span>
                    <span>Đơn giá</span>
                    <span>Thành tiền</span>
                </div>
                <div class="divider"></div>

                <div v-for="item in order.items" :key="item.id" class="item-row">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-quantity">{{ item.quantity }}</div>
                    <div class="item-price">{{ formatCurrency(item.price) }}</div>
                    <div class="item-total">{{ formatCurrency(item.price * item.quantity) }}</div>
                </div>

                <div class="divider"></div>
            </div>

            <div class="receipt-summary">
                <div class="summary-row">
                    <span>Tạm tính:</span>
                    <span>{{ formatCurrency(order.subtotal) }}</span>
                </div>
                <div class="summary-row">
                    <span>Thuế (10%):</span>
                    <span>{{ formatCurrency(order.tax) }}</span>
                </div>
                <div class="divider"></div>
                <div class="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>{{ formatCurrency(order.total) }}</span>
                </div>
            </div>

            <div class="receipt-footer">
                <div class="divider"></div>
                <p>Cảm ơn bạn đã đến với {{ restaurantInfo.name }}!</p>
                <p>Hẹn gặp lại!</p>
            </div>
        </div>

        <!-- Print Controls -->
        <div class="print-controls no-print">
            <button @click="printReceipt" class="btn-print">
                <i class="fas fa-print"></i>
                In hóa đơn
            </button>
            <button @click="$emit('close')" class="btn-close">
                <i class="fas fa-times"></i>
                Đóng
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/format'

const props = defineProps({
    order: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])

const restaurantInfo = {
    name: 'Food Order Restaurant',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
    phone: '0123-456-789'
}

const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getPaymentMethodText = (method) => {
    const methods = {
        cash: 'Tiền mặt',
        card: 'Thẻ',
        transfer: 'Chuyển khoản'
    }
    return methods[method] || method
}

const printReceipt = () => {
    window.print()
}
</script>

<style scoped>
.receipt-container {
    max-width: 400px;
    margin: 0 auto;
    background: white;
    padding: 20px;
}

.receipt-print {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #000;
    background: white;
}

.receipt-header {
    text-align: center;
    margin-bottom: 15px;
}

.receipt-header h2 {
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 5px 0;
}

.receipt-header p {
    margin: 2px 0;
    font-size: 11px;
}

.divider {
    border-top: 1px dashed #000;
    margin: 8px 0;
}

.receipt-info {
    margin-bottom: 15px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
}

.items-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    font-weight: bold;
    margin-bottom: 5px;
}

.items-header span {
    text-align: center;
}

.items-header span:first-child {
    text-align: left;
}

.item-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 8px;
    margin-bottom: 3px;
    align-items: center;
}

.item-name {
    text-align: left;
    font-size: 11px;
}

.item-quantity,
.item-price,
.item-total {
    text-align: center;
    font-size: 11px;
}

.receipt-summary {
    margin-top: 15px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
}

.summary-row.total {
    font-weight: bold;
    font-size: 14px;
}

.receipt-footer {
    text-align: center;
    margin-top: 15px;
    font-size: 11px;
}

.receipt-footer p {
    margin: 3px 0;
}

.print-controls {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn-print,
.btn-close {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.btn-print {
    background-color: #4CAF50;
    color: white;
}

.btn-print:hover {
    background-color: #45a049;
}

.btn-close {
    background-color: #f44336;
    color: white;
}

.btn-close:hover {
    background-color: #da190b;
}

/* Print styles */
@media print {
    body * {
        visibility: hidden;
    }

    .receipt-print,
    .receipt-print * {
        visibility: visible;
    }

    .receipt-print {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 20px;
    }

    .no-print {
        display: none !important;
    }

    .receipt-container {
        padding: 0;
        margin: 0;
        max-width: none;
    }
}

@page {
    size: 80mm auto;
    margin: 10mm;
}
</style>
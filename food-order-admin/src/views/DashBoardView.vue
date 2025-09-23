<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p class="text-gray-600">Tổng quan về hoạt động kinh doanh</p>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                    <input v-model="filters.startDate" type="date"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                    <input v-model="filters.endDate" type="date"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div class="flex items-end">
                    <button @click="loadDashboard" :disabled="loading"
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <div v-if="loading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Đang tải...
                        </div>
                        <span v-else>Cập nhật</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !dashboardData" class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Đang tải dữ liệu dashboard...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                    <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                </div>
            </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else-if="dashboardData" class="space-y-6">
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Revenue -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Tổng doanh thu</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(dashboardData.totalRevenue) }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Total Orders -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ dashboardData.totalOrders }}</p>
                        </div>
                    </div>
                </div>

                <!-- Total Products -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Tổng sản phẩm</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ dashboardData.totalProducts }}</p>
                        </div>
                    </div>
                </div>

                <!-- Average Order Value -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Giá trị đơn hàng TB</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(dashboardData.averageOrderValue)
                                }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Lists -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Order Status Chart -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                    <OrderStatusChart :data="orderChartData" />

                    <!-- Order Status Details -->
                    <div class="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <div class="text-center" v-if="dashboardData.pendingOrders > 0">
                            <div class="text-xl font-bold text-yellow-600">{{ dashboardData.pendingOrders }}</div>
                            <div class="text-xs text-gray-500">Chờ xác nhận</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.acceptedOrders > 0">
                            <div class="text-xl font-bold text-blue-600">{{ dashboardData.acceptedOrders }}</div>
                            <div class="text-xs text-gray-500">Đã xác nhận</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.processingOrders > 0">
                            <div class="text-xl font-bold text-purple-600">{{ dashboardData.processingOrders }}</div>
                            <div class="text-xs text-gray-500">Đang xử lý</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.doneOrders > 0">
                            <div class="text-xl font-bold text-cyan-600">{{ dashboardData.doneOrders }}</div>
                            <div class="text-xs text-gray-500">Hoàn thành chế biến</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.shippingOrders > 0">
                            <div class="text-xl font-bold text-orange-600">{{ dashboardData.shippingOrders }}</div>
                            <div class="text-xs text-gray-500">Đang giao hàng</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.completedOrders > 0">
                            <div class="text-xl font-bold text-green-600">{{ dashboardData.completedOrders }}</div>
                            <div class="text-xs text-gray-500">Hoàn thành</div>
                        </div>
                        <div class="text-center" v-if="dashboardData.cancelledOrders > 0">
                            <div class="text-xl font-bold text-red-600">{{ dashboardData.cancelledOrders }}</div>
                            <div class="text-xs text-gray-500">Đã hủy</div>
                        </div>
                    </div>
                </div>

                <!-- Top Products -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Top sản phẩm bán chạy</h3>
                    <div class="space-y-4">
                        <div v-for="(product, index) in topProducts" :key="product.id"
                            class="flex items-center space-x-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 hover:border-gray-100 transition-all duration-200">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span class="text-blue-600 font-bold">#{{ index + 1 }}</span>
                                </div>
                            </div>
                            <div class="flex-shrink-0">
                                <img :src="product.imageUrl" :alt="product.name"
                                    class="w-12 h-12 rounded-xl object-cover border border-gray-100"
                                    @error="handleImageError" />
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
                                <p class="text-sm text-gray-500">{{ formatMoney(product.price) }}</p>
                                <span
                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    {{ product.productType }}
                                </span>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-medium text-gray-900">{{ product.soldQuantity }} bán</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Period Info -->
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-blue-800">Thông tin thời gian</h3>
                        <p class="mt-1 text-sm text-blue-700">
                            Dữ liệu từ {{ formatDate(dashboardData.periodStart) }} đến {{
                                formatDate(dashboardData.periodEnd) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                    </path>
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu</h3>
            <p class="text-gray-600 mb-4">Nhấn "Cập nhật" để tải dữ liệu dashboard</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { formatMoney } from '@/utils/format'
import OrderStatusChart from '@/components/charts/OrderStatusChart.vue'

const dashboardStore = useDashboardStore()

// Reactive data
const filters = ref({
    startDate: '',
    endDate: ''
})

// Computed properties
const loading = computed(() => dashboardStore.loading)
const error = computed(() => dashboardStore.error)
const dashboardData = computed(() => dashboardStore.dashboardData)
const orderChartData = computed(() => dashboardStore.orderChartData)
const topProducts = computed(() => dashboardStore.topProducts)

// Methods
const loadDashboard = async () => {
    const query = {}

    if (filters.value.startDate) {
        query.startDate = filters.value.startDate
    }

    if (filters.value.endDate) {
        query.endDate = filters.value.endDate
    }

    await dashboardStore.fetchDashboardSummary(query)
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const handleImageError = (event) => {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yNCAyOEMyNi4yMDkxIDI4IDI4IDI2LjIwOTEgMjggMjRDMjggMjEuNzkwOSAyNi4yMDkxIDIwIDI0IDIwQzIxLjc5MDkgMjAgMjAgMjEuNzkwOSAyMCAyNEMyMCAyNi4yMDkxIDIxLjc5MDkgMjggMjQgMjhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
}

// Set default dates (current month)
const setDefaultDates = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    filters.value.startDate = firstDayOfMonth.toISOString().split('T')[0]
    filters.value.endDate = today.toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
    setDefaultDates()
    loadDashboard()
})
</script>

<style scoped>
/* Hiệu ứng hover cho card */
.hover\:bg-gray-50:hover {
    background-color: #f9fafb;
}
</style>
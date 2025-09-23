<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Báo cáo doanh thu</h1>
            <p class="text-gray-600">Theo dõi và phân tích doanh thu cửa hàng</p>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <!-- Filter Type Selection -->
            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">Chọn kiểu lọc</label>
                <div class="flex gap-6">
                    <label class="flex items-center">
                        <input v-model="filterType" type="radio" value="dateRange"
                            class="mr-2 text-blue-600 focus:ring-blue-500" />
                        <span class="text-sm text-gray-700">Theo khoảng thời gian cụ thể</span>
                    </label>
                    <label class="flex items-center">
                        <input v-model="filterType" type="radio" value="periodType"
                            class="mr-2 text-blue-600 focus:ring-blue-500" />
                        <span class="text-sm text-gray-700">Theo loại thời gian</span>
                    </label>
                </div>
            </div>

            <!-- Date Range Filter -->
            <div v-if="filterType === 'dateRange'" class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <button @click="loadRevenue" :disabled="loading"
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
                        <span v-else>Xem báo cáo</span>
                    </button>
                </div>
            </div>

            <!-- Period Type Filter -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Loại thời gian</label>
                    <select v-model="filters.Period"
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="daily">Theo ngày</option>
                        <option value="weekly">Theo tuần</option>
                        <option value="monthly">Theo tháng</option>
                        <option value="yearly">Theo năm</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button @click="loadRevenue" :disabled="loading"
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
                        <span v-else>Xem báo cáo</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !revenue" class="flex items-center justify-center py-12">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Đang tải dữ liệu doanh thu...</p>
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

        <!-- Revenue Data -->
        <div v-else-if="revenue" class="space-y-6">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(revenue.totalRevenue) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Phí vận chuyển</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(revenue.totalShippingFee) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Tổng giảm giá</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ formatMoney(revenue.totalDiscount) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
                            <p class="text-2xl font-bold text-gray-900">{{ revenue.totalOrders }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Revenue Chart -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu theo thời gian</h3>
                    <RevenueChart :data="revenue.details" />
                </div>

                <!-- Order Count Chart -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Số lượng đơn hàng theo thời gian</h3>
                    <OrderChart :data="revenue.details" />
                </div>
            </div>

            <!-- Revenue Breakdown Chart -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Phân tích cấu trúc doanh thu</h3>
                <RevenueBreakdownChart :data="revenue" />
            </div>

            <!-- Details Table -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-900">Chi tiết doanh thu</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Khoảng thời gian</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Doanh thu</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phí vận chuyển</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giảm giá</th>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Số đơn hàng</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-100">
                            <tr v-for="detail in revenue.details" :key="detail.period">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ detail.period }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{{
                                    formatMoney(detail.revenue) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{
                                    formatMoney(detail.shippingFee) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">{{
                                    formatMoney(detail.discount) }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ detail.orderCount }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
            <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu doanh thu</h3>
            <p class="text-gray-600 mb-4">
                {{ filterType === 'dateRange'
                    ? 'Chọn khoảng thời gian và nhấn "Xem báo cáo" để xem dữ liệu doanh thu'
                    : 'Chọn loại thời gian và nhấn "Xem báo cáo" để xem dữ liệu doanh thu' }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/orderStore'
import { formatMoney } from '@/utils/format'
import RevenueChart from '@/components/charts/RevenueChart.vue'
import OrderChart from '@/components/charts/OrderChart.vue'
import RevenueBreakdownChart from '@/components/charts/RevenueBreakdownChart.vue'

const orderStore = useOrderStore()

// Reactive data
const filterType = ref('dateRange') // 'dateRange' hoặc 'periodType'
const filters = ref({
    startDate: '',
    endDate: '',
    Period: 'weekly' // Đổi từ periodType thành Period để match với API
})

// Computed properties
const loading = computed(() => orderStore.loading)
const error = computed(() => orderStore.error)
const revenue = computed(() => orderStore.revenue)

// Methods
const loadRevenue = async () => {
    const query = {}

    if (filterType.value === 'dateRange') {
        // Chỉ gửi StartDate và EndDate khi chọn khoảng thời gian cụ thể (Pascal case để match API)
        if (filters.value.startDate) {
            query.StartDate = filters.value.startDate
        }
        if (filters.value.endDate) {
            query.EndDate = filters.value.endDate
        }
    } else {
        // Chỉ gửi Period khi chọn theo loại thời gian (Pascal case để match API)
        if (filters.value.Period) {
            query.Period = filters.value.Period
        }
    }

    await orderStore.fetchRevenue(query)
}

// Set default dates
const setDefaultDates = () => {
    const today = new Date()
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    filters.value.endDate = today.toISOString().split('T')[0]
    filters.value.startDate = oneWeekAgo.toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
    setDefaultDates()
    loadRevenue()
})
</script>
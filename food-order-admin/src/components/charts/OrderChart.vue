<template>
    <div class="chart-container" style="height: 400px;">
        <Bar :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    }
})

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) {
        return {
            labels: [],
            datasets: []
        }
    }

    const labels = props.data.map(item => {
        const startDate = new Date(item.periodStart)
        const endDate = new Date(item.periodEnd)

        // Format label based on period length
        const diffTime = Math.abs(endDate - startDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays <= 1) {
            return startDate.toLocaleDateString('vi-VN')
        } else if (diffDays <= 7) {
            return `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}`
        } else {
            return item.period
        }
    })

    const orderData = props.data.map(item => item.orderCount)

    return {
        labels,
        datasets: [
            {
                label: 'Số đơn hàng',
                data: orderData,
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                ],
                borderColor: [
                    'rgba(147, 51, 234, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 12,
                    family: 'Inter, sans-serif'
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'rect'
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
                label: function (context) {
                    const label = context.dataset.label || ''
                    const value = context.parsed.y
                    return `${label}: ${value} đơn`
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 11,
                    family: 'Inter, sans-serif'
                },
                color: '#6b7280'
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    size: 11,
                    family: 'Inter, sans-serif'
                },
                color: '#6b7280',
                stepSize: 1,
                callback: function (value) {
                    return value + ' đơn'
                }
            }
        }
    },
    elements: {
        bar: {
            borderRadius: 8
        }
    }
}))
</script>

<style scoped>
.chart-container {
    position: relative;
}
</style>
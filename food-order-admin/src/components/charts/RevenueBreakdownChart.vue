<template>
    <div class="chart-container" style="height: 400px;">
        <Doughnut :data="chartData" :options="chartOptions" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    }
})

const chartData = computed(() => {
    if (!props.data || !props.data.totalRevenue) {
        return {
            labels: [],
            datasets: []
        }
    }

    const netRevenue = props.data.totalRevenue - props.data.totalDiscount
    const shippingFee = props.data.totalShippingFee
    const discount = props.data.totalDiscount

    return {
        labels: ['Doanh thu thuần', 'Phí vận chuyển', 'Giảm giá'],
        datasets: [
            {
                data: [netRevenue, shippingFee, discount],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2,
                hoverBackgroundColor: [
                    'rgba(59, 130, 246, 0.9)',
                    'rgba(16, 185, 129, 0.9)',
                    'rgba(239, 68, 68, 0.9)'
                ],
                hoverBorderWidth: 3
            }
        ]
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: {
                    size: 12,
                    family: 'Inter, sans-serif'
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
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
                    const label = context.label || ''
                    const value = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(context.parsed)

                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = ((context.parsed / total) * 100).toFixed(1)

                    return `${label}: ${value} (${percentage}%)`
                }
            }
        }
    },
    elements: {
        arc: {
            borderWidth: 2
        }
    }
}))
</script>

<style scoped>
.chart-container {
    position: relative;
}
</style>
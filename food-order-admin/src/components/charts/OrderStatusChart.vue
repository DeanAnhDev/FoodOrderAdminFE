<template>
    <div class="chart-container" style="height: 300px;">
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
    if (!props.data || !props.data.datasets) {
        return {
            labels: [],
            datasets: []
        }
    }

    return {
        labels: props.data.labels,
        datasets: [{
            ...props.data.datasets[0],
            // Sử dụng trực tiếp dữ liệu từ store đã được chuẩn bị sẵn
        }]
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                font: {
                    size: 11,
                    family: 'Inter, sans-serif'
                },
                padding: 15,
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 12,
                boxHeight: 12
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 10,
            displayColors: true,
            titleFont: {
                size: 14,
                weight: 'bold'
            },
            bodyFont: {
                size: 13
            },
            padding: 12,
            callbacks: {
                label: function (context) {
                    const label = context.label || ''
                    const value = context.parsed
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

                    return `${label}: ${value} đơn (${percentage}%)`
                }
            }
        }
    },
    elements: {
        arc: {
            borderWidth: 1,
            borderJoinStyle: 'round',
            borderAlign: 'inner'
        }
    },
    interaction: {
        intersect: false
    },
    animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1000
    }
}))
</script>

<style scoped>
.chart-container {
    position: relative;
}
</style>
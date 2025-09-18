<script setup>
import { ref, watch, onMounted } from 'vue'
import { usePromotionStore } from '@/stores/promotionStore'
import { useFoodStore } from '@/stores/foodStore'
import { useComboStore } from '@/stores/comboStore'
import { useToast } from "vue-toastification"

const toast = useToast()
const props = defineProps({
    visible: Boolean,
    promotion: Object // dữ liệu khuyến mãi cần edit
})
const emit = defineEmits(['close', 'updated'])

const promotionStore = usePromotionStore()
const foodStore = useFoodStore()
const comboStore = useComboStore()
const today = new Date().toISOString().split('T')[0] // yyyy-MM-dd
const form = ref({
    id: null,
    promotionName: '',
    discountAmount: 0,
    type: 'Amount',
    startDate: '',
    endDate: '',
    isActive: true,
    foodIds: [],
    comboIds: []
})


const foods = ref([])
const combos = ref([])

onMounted(async () => {
    await foodStore.fetchFoods()
    await comboStore.fetchCombos()
    foods.value = foodStore.foods
    combos.value = comboStore.combos
})

watch(() => props.promotion, (val) => {
    console.log(val);
    if (val) {
        form.value = {

            ...form.value, // giữ default
            id: val.promotionId ?? null,
            promotionName: val.promotionName ?? '',
            discountAmount: val.discountAmount ?? 0,
            type: val.type ?? 'Amount',
            startDate: val.startDate ? val.startDate.split('T')[0] : '',
            endDate: val.endDate ? val.endDate.split('T')[0] : '',
            isActive: val.isActive ?? true,
            foodIds: val.foodIds || [],
            comboIds: val.comboIds || []
        }
    }
}, { immediate: true })

const handleSubmit = async () => {
    try {
        const payload = { ...form.value }
        await promotionStore.updatePromotion(payload.id, payload)
        toast.success("Cập nhật khuyến mãi thành công ")
        emit('updated')
        close()
    } catch (error) {
        toast.error(error.response?.data?.message || "Cập nhật khuyến mãi thất bại ")
    }
}


const close = () => {
    emit('close')
}
</script>

<template>
    <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Chỉnh sửa khuyến mãi</h2>
                <button @click="close" class="text-gray-500 hover:text-gray-700">✖</button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Tên khuyến mãi -->
                <div>
                    <label class="block text-sm font-medium mb-1">Tên khuyến mãi</label>
                    <input v-model="form.promotionName" type="text" class="w-full border rounded-lg px-3 py-2"
                        required />
                </div>

                <!-- Giá trị giảm & Loại -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Giá trị giảm</label>
                        <input v-model.number="form.discountAmount" type="number" min="1"
                            class="w-full border rounded-lg px-3 py-2" required />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Loại giảm</label>
                        <select v-model="form.type" class="w-full border rounded-lg px-3 py-2">
                            <option value="Amount">Theo số tiền (VNĐ)</option>
                            <option value="Percentage">Theo phần trăm (%)</option>
                        </select>
                    </div>
                </div>

                <!-- Ngày -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                        <input v-model="form.startDate" type="date" class="w-full border rounded-lg px-3 py-2"
                            disabled />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Ngày kết thúc</label>
                        <input v-model="form.endDate" type="date" :min="today"
                            class="w-full border rounded-lg px-3 py-2" required />
                    </div>
                </div>

                <!-- Active -->
                <div>
                    <label class="inline-flex items-center">
                        <input v-model="form.isActive" type="checkbox" class="mr-2" />
                        Kích hoạt khuyến mãi
                    </label>
                </div>

                <!-- Actions -->
                <div class="flex justify-end space-x-3 pt-4">
                    <button type="button" @click="close" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                        Hủy
                    </button>
                    <button type="submit" class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

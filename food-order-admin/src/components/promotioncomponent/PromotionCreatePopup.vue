<script setup>
import { ref, onMounted } from 'vue'
import { usePromotionStore } from '@/stores/promotionStore'
import { useFoodStore } from '@/stores/foodStore'
import { useComboStore } from '@/stores/comboStore'
import { useToast } from "vue-toastification"

const toast = useToast()
const props = defineProps({
    visible: Boolean
})
const emit = defineEmits(['close', 'created'])
const today = new Date().toISOString().split('T')[0] // yyyy-MM-dd
const promotionStore = usePromotionStore()
const foodStore = useFoodStore()
const comboStore = useComboStore()

const form = ref({
    promotionName: '',
    discountAmount: 0,
    type: 'Amount', // enum: Amount | Percent
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

const handleSubmit = async () => {
    try {
        const payload = { ...form.value }
        await promotionStore.createPromotion(payload)
        toast.success("Tạo khuyến mãi thành công 🎉")
        emit('created')
        close()
    } catch (error) {

        toast.error(error.response?.data?.message || "Tạo khuyến mãi thất bại ❌")
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
                <h2 class="text-xl font-bold">Tạo khuyến mãi</h2>
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

                <!-- Số tiền giảm & Loại khuyến mãi -->
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

                <!-- Ngày bắt đầu / kết thúc -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                        <input v-model="form.startDate" type="date" :min="today"
                            class="w-full border rounded-lg px-3 py-2" required />
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
                    <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        Tạo mới
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

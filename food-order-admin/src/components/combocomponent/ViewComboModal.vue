<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div class="bg-white w-[900px] max-h-[90vh] rounded-lg p-6 overflow-y-auto shadow-lg">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Chi tiết Combo</h2>
                <button @click="$emit('close')" class="text-gray-600 hover:text-black text-2xl">&times;</button>
            </div>

            <div v-if="combo" class="space-y-6">
                <!-- Thông tin cơ bản -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p><strong>Tên combo:</strong> {{ combo.comboName }}</p>
                        <p><strong>Danh mục:</strong> {{ getCategoryName(combo.foodCategoryId) }}</p>
                        <p><strong>Giá:</strong> {{ formatPrice(combo.price) }}</p>
                        <p><strong>Trạng thái:</strong>
                            <span :class="combo.status ? 'text-green-600' : 'text-gray-500'">
                                {{ combo.status ? 'Hiển thị' : 'Ẩn' }}
                            </span>
                        </p>
                        <p><strong>Kho:</strong>
                            <span :class="combo.isOutOfStock ? 'text-red-600' : 'text-blue-600'">
                                {{ combo.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p><strong>Mô tả:</strong></p>
                        <p class="whitespace-pre-wrap">{{ combo.description }}</p>
                        <div v-if="combo.images?.url" class="mt-2">
                            <img :src="combo.images.url" alt="combo" class="w-40 h-40 object-cover rounded-md border" />
                        </div>
                    </div>
                </div>

                <!-- Danh sách món -->
                <div>
                    <h3 class="text-lg font-semibold mb-2">Danh sách món trong combo</h3>
                    <table class="w-full text-sm border">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="p-2">Ảnh</th>
                                <th class="p-2">Tên món</th>
                                <th class="p-2">Giá</th>
                                <th class="p-2">Trạng thái</th>
                                <th class="p-2">Kho</th>
                                <th class="p-2">Số lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in combo.comboDetails" :key="item.food.foodId">
                                <td class="p-2">
                                    <img v-if="item.food.images?.url" :src="item.food.images.url" alt="food"
                                        class="w-12 h-12 object-cover rounded" />
                                </td>

                                <td class="p-2 font-medium">{{ item.food.foodName }}</td>
                                <td class="p-2">{{ formatPrice(item.food.price) }}</td>
                                <td class="p-2">
                                    <span :class="item.food.status ? 'text-green-600' : 'text-gray-500'">
                                        {{ item.food.status ? 'Hiển thị' : 'Ẩn' }}
                                    </span>
                                </td>
                                <td class="p-2">
                                    <span :class="item.food.isOutOfStock ? 'text-red-600' : 'text-blue-600'">
                                        {{ item.food.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
                                    </span>
                                </td>
                                <td class="p-2">{{ item.quantity }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="text-center text-gray-500 py-6">Đang tải dữ liệu combo...</div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useComboStore } from '@/stores/comboStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatPrice } from '@/utils/format'
import { useToast } from 'vue-toastification'

const props = defineProps({
    isOpen: Boolean,
    comboId: Number
})
const emit = defineEmits(['close'])

const comboStore = useComboStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const combo = ref(null)

const getCategoryName = (id) => {
    return categoryStore.categories.find(c => c.foodCategoryId === id)?.categoryName || '---'
}

watch(() => props.comboId, async (id) => {
    if (!id) return
    try {
        await categoryStore.fetchCategories()
        await comboStore.fetchComboById(id)
        combo.value = comboStore.selectedCombo
    } catch (err) {
        toast.error('Lỗi khi tải combo')
    }
}, { immediate: true })
</script>

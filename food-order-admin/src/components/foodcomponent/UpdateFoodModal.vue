<!-- src/components/foodcomponent/UpdateFoodModal.vue -->
<template>
    <div v-if="isOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-xl">
            <h2 class="text-lg font-bold mb-4">Cập nhật món ăn</h2>

            <form @submit.prevent="handleSubmit">
                <!-- Tên món -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Tên món</label>
                    <input v-model="form.foodName" class="w-full border p-2 rounded" required />
                </div>

                <!-- Danh mục -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Danh mục</label>
                    <select v-model="form.foodCategoryId" class="w-full border p-2 rounded">
                        <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId"
                            :value="cat.foodCategoryId">
                            {{ cat.categoryName }}
                        </option>
                    </select>
                </div>

                <!-- Mô tả -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Mô tả</label>
                    <textarea v-model="form.description" class="w-full border p-2 rounded"></textarea>
                </div>

                <!-- Giá -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Giá</label>
                    <input type="number" v-model.number="form.price" class="w-full border p-2 rounded" required
                        min="0" />
                </div>
                <!-- Trạng thái -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Trạng thái</label>
                    <select v-model="form.status" class="w-full border p-2 rounded">
                        <option :value="true">Đang bán</option>
                        <option :value="false">Ngừng bán</option>
                    </select>
                </div>

                <!-- Tình trạng kho -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Tình trạng kho</label>
                    <select v-model="form.isOutOfStock" class="w-full border p-2 rounded">
                        <option :value="false">Còn hàng</option>
                        <option :value="true">Hết hàng</option>
                    </select>
                </div>

                <!-- Ảnh -->
                <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh món</label>
                    <div class="flex items-center gap-4">
                        <div
                            class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                            <img v-if="form.images.url" :src="form.images.thumbnailUrl || form.images.url"
                                class="w-full h-full object-cover" alt="Ảnh món ăn" />
                            <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
                        </div>

                        <div class="flex flex-col gap-2">
                            <input type="file" @change="handleImageUpload" accept="image/*"
                                class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            <p v-if="form.images.name" class="text-xs text-gray-500 truncate max-w-[180px]">
                                {{ form.images.name }}
                            </p>
                        </div>
                    </div>
                </div>


                <!-- Nút hành động -->
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded">
                        Hủy
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFoodStore } from '@/stores/foodStore'

const props = defineProps({
    isOpen: Boolean,
    food: Object
})
const emit = defineEmits(['close', 'updated'])

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()
const foodStore = useFoodStore()

const form = ref({
    foodId: '',
    foodCategoryId: '',
    foodName: '',
    description: '',
    price: 0,
    status: true,
    isOutOfStock: false,
    images: {
        id: '',
        url: '',
        thumbnailUrl: '',
        name: ''
    }
})


// Khi mở modal, gán lại form từ props.food
watch(
    () => props.isOpen,
    (val) => {
        if (val && props.food) {
            form.value = {
                foodId: props.food.foodId,
                foodCategoryId: props.food.foodCategoryId,
                foodName: props.food.foodName,
                description: props.food.description,
                price: props.food.price,
                status: props.food.status,
                isOutOfStock: props.food.isOutOfStock,
                images: props.food.images || {
                    id: '',
                    url: '',
                    thumbnailUrl: '',
                    name: ''
                }
            }

        }
    }
)

const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Nếu có ảnh cũ thì xóa
    const oldId = form.value.images.id
    if (oldId) {
        await uploadStore.remove(oldId)
    }

    const id = crypto.randomUUID()
    try {
        const imageData = await uploadStore.upload(file, id)
        form.value.images = imageData
    } catch (err) {
        console.error('Lỗi upload ảnh:', err)
        alert('Upload ảnh thất bại')
    }
}

const handleSubmit = async () => {
    try {
        await foodStore.updateFood(form.value)
        emit('updated')
        emit('close')
    } catch (err) {
        console.error('Lỗi cập nhật món ăn:', err)
        alert('Cập nhật món ăn thất bại')
    }
}
</script>

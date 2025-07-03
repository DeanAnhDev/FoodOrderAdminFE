<template>
    <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-[550px] relative shadow-2xl ring-1 ring-black/10">
            <h2 class="text-lg font-bold mb-4">Thêm món ăn mới</h2>

            <form @submit.prevent="handleSubmit">
                <!-- Tên món -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Tên món</label>
                    <input v-model="form.foodName" class="w-full border p-2 rounded" required />
                </div>

                <!-- Danh mục -->
                <div class="mb-3">
                    <label class="block text-sm font-medium">Danh mục</label>
                    <select v-model="form.foodCategoryId" class="w-full border p-2 rounded" required>
                        <option disabled value="">-- Chọn danh mục --</option>
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
                    <input v-model.number="form.price" type="number" class="w-full border p-2 rounded" min="0"
                        required />
                </div>

                <!-- Ảnh -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh món ăn</label>

                    <div class="flex items-center gap-4">
                        <div
                            class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                            <img v-if="form.images.url" :src="form.images.thumbnailUrl || form.images.url"
                                class="w-full h-full object-cover" alt="Ảnh món ăn" />
                            <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
                        </div>

                        <div class="flex flex-col gap-2">
                            <input type="file" @change="handleImageUpload" accept="image/*"
                                class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                            <p v-if="form.images.name" class="text-xs text-gray-500 truncate max-w-[180px]">
                                {{ form.images.name }}
                            </p>
                        </div>
                    </div>
                </div>


                <!-- Nút -->
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">Lưu</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFoodStore } from '@/stores/foodStore'

const props = defineProps({
    isOpen: Boolean
})
const emit = defineEmits(['close', 'created'])

const categoryStore = useCategoryStore()
const uploadStore = useUploadStore()
const foodStore = useFoodStore()

const form = ref({
    foodCategoryId: '',
    foodName: '',
    description: '',
    price: 0,
    images: {
        id: '',
        url: '',
        thumbnailUrl: '',
        name: ''
    }
})

// Load danh mục nếu chưa có
onMounted(() => {
    if (categoryStore.categories.length === 0) {
        categoryStore.fetchCategories()
    }
})

// Reset form khi mở modal
watch(
    () => props.isOpen,
    (open) => {
        if (open) {
            form.value = {
                foodCategoryId: '',
                foodName: '',
                description: '',
                price: 0,
                images: {
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

    const oldId = form.value.images.id
    if (oldId) {
        await uploadStore.remove(oldId)
    }

    try {
        const imageData = await uploadStore.upload(file, crypto.randomUUID())
        form.value.images = imageData
    } catch (err) {
        console.error('Upload lỗi:', err)
        alert('Tải ảnh thất bại')
    }
}

const handleSubmit = async () => {
    try {
        await foodStore.createFood(form.value)
        emit('created')
        emit('close')
    } catch (err) {
        console.error('Lỗi tạo món ăn:', err)
        alert('Thêm món thất bại')
    }
}
</script>

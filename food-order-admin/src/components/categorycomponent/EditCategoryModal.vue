<template>
    <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">

        <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 backdrop-blur-none">

            <h2 class="text-lg font-bold mb-4">Cập nhật danh mục</h2>

            <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                    <label class="block text-sm font-medium">Tên danh mục</label>
                    <input v-model="form.categoryName" class="w-full border p-2 rounded" required />
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium">Mô tả</label>
                    <textarea v-model="form.description" class="w-full border p-2 rounded"></textarea>
                </div>

                <div class="mb-3">
                    <label class="block text-sm font-medium">Ảnh</label>
                    <input type="file" @change="handleImageUpload" accept="image/*" />
                    <div v-if="form.images?.url" class="mt-2">
                        <img :src="form.images.thumbnailUrl || form.images.url"
                            class="w-24 h-24 object-cover rounded border" />
                        <p class="text-xs mt-1 italic text-gray-500 truncate">{{ form.images.name }}</p>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                    <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">Cập nhật</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'

const props = defineProps({
    isOpen: Boolean,
    categoryData: Object
})
const emit = defineEmits(['close', 'updated'])

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()

const form = ref({
    foodCategoryId: 0,
    categoryName: '',
    description: '',
    images: {
        id: '',
        url: '',
        thumbnailUrl: '',
        name: ''
    }
})

watch(() => props.isOpen, (newVal) => {
    if (newVal && props.categoryData) {
        form.value = {
            foodCategoryId: props.categoryData.foodCategoryId,
            categoryName: props.categoryData.categoryName || '',
            description: props.categoryData.description || '',
            images: props.categoryData.images || {
                id: '',
                url: '',
                thumbnailUrl: '',
                name: ''
            }
        }
    }
})

const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Nếu đã có ảnh cũ → xoá trước
    const oldImageId = form.value.images.id
    if (oldImageId) {
        const ok = await uploadStore.remove(oldImageId)
        if (!ok) {
            console.warn('Không xoá được ảnh cũ')
        }
    }

    // Upload ảnh mới
    const id = crypto.randomUUID()

    try {
        const imageData = await uploadStore.upload(file, id)
        form.value.images = imageData
    } catch (error) {
        console.error('Lỗi upload ảnh:', error)
        alert('Upload ảnh thất bại')
    }
}

const handleSubmit = async () => {
    try {
        await categoryStore.updateCategory(form.value)
        emit('updated')
        emit('close')
    } catch (err) {
        console.error('Lỗi cập nhật danh mục:', err)
        alert('Cập nhật thất bại')
    }
}
</script>

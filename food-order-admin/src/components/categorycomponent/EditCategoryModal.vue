<template>
  <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 backdrop-blur-none">
      <h2 class="text-lg font-bold mb-4">Cập nhật danh mục</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Tên danh mục -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Tên danh mục</label>
          <input v-model="form.categoryName" class="w-full border p-2 rounded" required />
        </div>

        <!-- Mô tả -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Mô tả</label>
          <textarea v-model="form.description" class="w-full border p-2 rounded"></textarea>
        </div>

        <!-- Ảnh -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh danh mục</label>
          <div class="flex items-center gap-4">
            <div
              class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"
            >
              <img
                v-if="form.images?.url"
                :src="form.images.thumbnailUrl || form.images.url"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
            </div>

            <div class="flex flex-col gap-2">
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p v-if="form.images.name" class="text-xs text-gray-500 truncate max-w-[180px]">
                {{ form.images.name }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nút hành động -->
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

  try {
    const id = crypto.randomUUID()
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

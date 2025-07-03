<template>
  <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 backdrop-blur-none">
      <h2 class="text-lg font-bold mb-4">Thêm danh mục mới</h2>

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

        <!-- Ảnh đại diện -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
          <div class="flex items-center gap-4">
            <div
              class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden"
            >
              <template v-if="isUploading">
                <div class="text-xs text-gray-400">Đang tải...</div>
              </template>
              <template v-else>
                <img
                  v-if="form.images?.url"
                  :src="form.images.thumbnailUrl || form.images.url"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
              </template>
            </div>

            <div class="flex flex-col gap-2">
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                :disabled="isUploading"
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
          <button type="button" @click="emit('close')" class="px-4 py-2 bg-gray-300 rounded" :disabled="isSubmitting">
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded"
            :disabled="!form.images.url || isSubmitting"
          >
            <span v-if="isSubmitting">Đang lưu...</span>
            <span v-else>Lưu</span>
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

const props = defineProps({
  isOpen: Boolean
})
const emit = defineEmits(['close', 'created'])

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()

const form = ref({
  categoryName: '',
  description: '',
  images: {
    id: '',
    url: '',
    thumbnailUrl: '',
    name: ''
  }
})

const isUploading = ref(false)
const isSubmitting = ref(false)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.value = {
        categoryName: '',
        description: '',
        images: {
          id: '',
          url: '',
          thumbnailUrl: '',
          name: ''
        }
      }
      isUploading.value = false
      isSubmitting.value = false
    }
  }
)

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const oldImageId = form.value.images.id
  if (oldImageId) {
    await uploadStore.remove(oldImageId)
  }

  const id = crypto.randomUUID()
  isUploading.value = true

  try {
    const imageData = await uploadStore.upload(file, id)
    form.value.images = imageData
  } catch (error) {
    console.error('Lỗi upload ảnh:', error)
    alert('Upload ảnh thất bại')
  } finally {
    isUploading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.images.url) {
    alert('Vui lòng chọn ảnh trước khi lưu.')
    return
  }

  isSubmitting.value = true
  try {
    await categoryStore.createCategory(form.value)
    alert('Thêm danh mục thành công!')
    emit('created')
    emit('close')
  } catch (err) {
    console.error('Lỗi tạo danh mục:', err)
    alert('Thêm danh mục thất bại')
  } finally {
    isSubmitting.value = false
  }
}
</script>

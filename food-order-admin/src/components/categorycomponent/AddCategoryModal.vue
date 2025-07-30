<template>
  <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 animate-fade-in">
      <h2 class="text-lg font-bold mb-4">Thêm danh mục mới</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Tên danh mục -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Tên danh mục</label>
          <input
            ref="firstInput"
            v-model="form.categoryName"
            maxlength="100"
            class="w-full border p-2 rounded"
            placeholder="Nhập tên danh mục"
          />
        </div>

        <!-- Mô tả -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Mô tả</label>
          <textarea
            v-model="form.description"
            maxlength="500"
            rows="3"
            class="w-full border p-2 rounded"
            placeholder="Nhập mô tả"
          />
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
                  alt="Ảnh danh mục"
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
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 bg-gray-300 rounded"
            :disabled="isSubmitting"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
            :disabled="isSubmitting"
          >
            <svg
              v-if="isSubmitting"
              class="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              />
            </svg>
            <span v-if="isSubmitting">Đang lưu...</span>
            <span v-else>Lưu</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useToast } from 'vue-toastification'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'created'])

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const firstInput = ref(null)
const isUploading = ref(false)
const isSubmitting = ref(false)

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

// Reset khi mở modal
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
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
      nextTick(() => firstInput.value?.focus())
    }
  }
)

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const oldId = form.value.images.id
  if (oldId) await uploadStore.remove(oldId)

  isUploading.value = true
  try {
    const imageData = await uploadStore.upload(file, crypto.randomUUID())
    form.value.images = imageData
    toast.success('Tải ảnh thành công!')
  } catch (err) {
    console.error('Lỗi upload:', err)
    toast.error('Upload ảnh thất bại!')
  } finally {
    isUploading.value = false
  }
}

const handleSubmit = async () => {
  const name = form.value.categoryName.trim()
  const desc = form.value.description.trim()
  const image = form.value.images.url

  if (!name) return toast.warning('Vui lòng nhập tên danh mục!')
  if (name.length > 100) return toast.warning('Tên danh mục không được vượt quá 100 ký tự!')
  if (desc.length > 500) return toast.warning('Mô tả không được vượt quá 500 ký tự!')
  if (!image) return toast.warning('Vui lòng chọn ảnh danh mục!')

  isSubmitting.value = true
  try {
    await categoryStore.createCategory(form.value)
    toast.success('Thêm danh mục thành công!')
    emit('created')
    emit('close')
  } catch (err) {
    console.error('Lỗi tạo danh mục:', err)
    toast.error('Thêm danh mục thất bại!')
  } finally {
    isSubmitting.value = false
  }
}
</script>

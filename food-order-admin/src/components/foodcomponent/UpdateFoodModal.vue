<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-xl animate-fade-in">
      <h2 class="text-lg font-bold mb-4">Cập nhật món ăn</h2>

      <form @submit.prevent="handleSubmit">
        <!-- Tên món -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Tên món</label>
          <input ref="firstInput" v-model="form.foodName" class="w-full border p-2 rounded" required />
        </div>

        <!-- Danh mục -->
        <div class="mb-3">
          <label class="block text-sm font-medium">Danh mục</label>
          <select v-model="form.foodCategoryId" class="w-full border p-2 rounded" required>
            <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.foodCategoryId">
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
          <input type="number" v-model.number="form.price" class="w-full border p-2 rounded" required min="0" />
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
          <button type="submit" :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 flex items-center gap-2">
            <svg v-if="loading" class="w-4 h-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            {{ loading ? 'Đang lưu...' : 'Lưu' }}
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
import { useToast } from 'vue-toastification'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFoodStore } from '@/stores/foodStore'

const props = defineProps({
  isOpen: Boolean,
  food: Object
})
const emit = defineEmits(['close', 'updated'])

const toast = useToast()
const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()
const foodStore = useFoodStore()

const loading = ref(false)
const firstInput = ref(null)

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

const resetForm = () => {
  form.value = {
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
  }
}

// Gán dữ liệu món ăn vào form khi mở modal
watch(
  () => props.isOpen,
  (val) => {
    if (val && props.food) {
      form.value = { ...props.food }
      form.value.images = props.food.images || {
        id: '',
        url: '',
        thumbnailUrl: '',
        name: ''
      }
      nextTick(() => {
        firstInput.value?.focus()
      })
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

  const id = crypto.randomUUID()
  try {
    const imageData = await uploadStore.upload(file, id)
    form.value.images = imageData
  } catch (err) {
    console.error('Lỗi upload ảnh:', err)
    toast.error('Upload ảnh thất bại')
  }
}

const handleSubmit = async () => {
  if (!form.value.images.url) {
    toast.warning('Vui lòng chọn ảnh món ăn!')
    return
  }

  loading.value = true
  try {
    await foodStore.updateFood(form.value)
    toast.success('Cập nhật món ăn thành công!')
    emit('updated')
    emit('close')
  } catch (err) {
    console.error('Lỗi cập nhật món ăn:', err)
    toast.error('Cập nhật món ăn thất bại')
  } finally {
    loading.value = false
  }
}
</script>

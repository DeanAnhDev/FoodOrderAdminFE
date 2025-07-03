<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      class="bg-white rounded-xl p-6 w-[600px] max-w-full shadow-2xl ring-1 ring-black/10 relative animate-fade-in"
    >
      <h2 class="text-xl font-bold mb-6 text-gray-800">Chi tiết danh mục</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <!-- Cột 1: Thông tin -->
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Tên danh mục:</label>
            <p class="text-base font-semibold text-gray-900 mt-1">
              {{ category?.categoryName || 'Không có dữ liệu' }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500">Mô tả:</label>
            <p class="text-base mt-1 text-gray-700 whitespace-pre-wrap">
              {{ category?.description || 'Không có mô tả' }}
            </p>
          </div>
        </div>

        <!-- Cột 2: Ảnh -->
        <div class="flex flex-col items-center">
          <label class="text-sm font-medium text-gray-500 mb-2">Ảnh đại diện</label>
          <div
            v-if="category?.images?.url"
            class="w-40 h-40 border rounded-lg overflow-hidden shadow-sm"
          >
            <img
              :src="category.images.thumbnailUrl || category.images.url"
              alt="Ảnh danh mục"
              class="w-full h-full object-cover"
            />
          </div>
          <p v-else class="text-gray-400 italic mt-2">Chưa có ảnh</p>
        </div>
      </div>

      <!-- Nút đóng -->
      <div class="flex justify-end mt-6">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  category: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

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

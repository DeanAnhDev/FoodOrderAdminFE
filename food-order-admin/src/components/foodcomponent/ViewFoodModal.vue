<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Chi tiết món ăn</h2>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-800">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Nội dung -->
      <div class="space-y-4 text-sm text-gray-700">
        <!-- Ảnh -->
        <div v-if="food.images?.url" class="text-center">
          <img :src="food.images.url" alt="Ảnh món ăn" class="w-40 h-40 object-cover rounded-lg mx-auto border" />
          <p class="text-xs mt-1 italic text-gray-500">{{ food.images.name }}</p>
        </div>

        <!-- Tên món -->
        <div>
          <strong class="block text-gray-600">Tên món:</strong>
          <p>{{ food.foodName }}</p>
        </div>

        <!-- Mô tả -->
        <div>
          <strong class="block text-gray-600">Mô tả:</strong>
          <p>{{ food.description || '(Không có mô tả)' }}</p>
        </div>

        <!-- Danh mục -->
        <div>
          <strong class="block text-gray-600">Danh mục:</strong>
          <p>{{ getCategoryName(food.foodCategoryId) }}</p>
        </div>

        <!-- Giá -->
        <div>
          <strong class="block text-gray-600">Giá:</strong>
          <p>{{ formatPrice(food.price) }}</p>
        </div>

        <!-- Trạng thái -->
        <div>
          <strong class="block text-gray-600">Trạng thái:</strong>
          <p :class="food.status ? 'text-green-600' : 'text-gray-500'">
            {{ food.status ? 'Đang bán' : 'Ngừng bán' }}
          </p>
        </div>

        <!-- Tình trạng kho -->
        <div>
          <strong class="block text-gray-600">Kho:</strong>
          <p :class="food.isOutOfStock ? 'text-red-600' : 'text-green-600'">
            {{ food.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
          </p>
        </div>

        <!-- Ngày tạo -->
        <div>
          <strong class="block text-gray-600">Ngày tạo:</strong>
          <p>{{ formatDate(food.createdAt) }}</p>
        </div>
      </div>

      <!-- Nút đóng -->
      <div class="mt-6 text-right">
        <button @click="emit('close')" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { formatPrice, formatDate } from '@/utils/format'
import { useCategoryStore } from '@/stores/categoryStore'

const props = defineProps({
  isOpen: Boolean,
  food: Object
})
const emit = defineEmits(['close'])

const categoryStore = useCategoryStore()

const getCategoryName = (id) => {
  const category = categoryStore.categories.find(cat => cat.foodCategoryId === id)
  return category ? category.categoryName : '---'
}
</script>

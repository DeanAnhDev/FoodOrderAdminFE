<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
    <div class="bg-white w-[900px] max-h-[90vh] rounded-2xl p-6 overflow-y-auto shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Chi tiết Combo</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
      </div>

      <!-- Nội dung combo -->
      <div v-if="combo" class="space-y-8">
        <!-- Thông tin cơ bản -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div class="space-y-2">
            <p><span class="font-semibold">🧾 Tên combo:</span> {{ combo.comboName }}</p>
            <p><span class="font-semibold">📂 Danh mục:</span> {{ getCategoryName(combo.foodCategoryId) }}</p>
            <p><span class="font-semibold">💰 Giá:</span> {{ formatPrice(combo.price) }}</p>
            <p>
              <span class="font-semibold">📢 Trạng thái:</span>
              <span :class="combo.status ? 'text-green-600' : 'text-gray-500'">
                {{ combo.status ? 'Hiển thị' : 'Ẩn' }}
              </span>
            </p>
            <p>
              <span class="font-semibold">🏬 Kho:</span>
              <span :class="combo.isOutOfStock ? 'text-red-600' : 'text-blue-600'">
                {{ combo.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
              </span>
            </p>
          </div>
          <div class="space-y-2">
            <p class="font-semibold">📝 Mô tả:</p>
            <p class="whitespace-pre-wrap text-gray-600">{{ combo.description }}</p>
            <div v-if="combo.images?.url" class="mt-3">
              <img :src="combo.images.url" alt="combo"
                class="w-40 h-40 object-cover rounded-md border shadow-sm" />
            </div>
          </div>
        </div>

        <!-- Danh sách món ăn -->
        <div>
          <h3 class="text-lg font-semibold mb-3 text-gray-800">🍽️ Danh sách món trong combo</h3>
          <div class="overflow-x-auto rounded-lg shadow">
            <table class="min-w-full text-sm border">
              <thead class="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th class="p-3">Ảnh</th>
                  <th class="p-3">Tên món</th>
                  <th class="p-3">Giá</th>
                  <th class="p-3">Trạng thái</th>
                  <th class="p-3">Kho</th>
                  <th class="p-3">Số lượng</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="item in combo.comboDetails" :key="item.food.foodId" class="hover:bg-gray-50">
                  <td class="p-3">
                    <img v-if="item.food.images?.url" :src="item.food.images.url" alt="food"
                      class="w-12 h-12 object-cover rounded" />
                  </td>
                  <td class="p-3 font-medium text-gray-800">{{ item.food.foodName }}</td>
                  <td class="p-3 text-gray-700">{{ formatPrice(item.food.price) }}</td>
                  <td class="p-3">
                    <span :class="item.food.status ? 'text-green-600' : 'text-gray-500'">
                      {{ item.food.status ? 'Hiển thị' : 'Ẩn' }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span :class="item.food.isOutOfStock ? 'text-red-600' : 'text-blue-600'">
                      {{ item.food.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
                    </span>
                  </td>
                  <td class="p-3">{{ item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-10 text-lg">
        <span class="animate-pulse">Đang tải dữ liệu combo...</span>
      </div>
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

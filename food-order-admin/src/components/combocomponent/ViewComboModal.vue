<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto relative shadow-xl animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">📦 Chi tiết Combo</h2>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-800">
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <!-- Nội dung -->
      <div v-if="combo" class="space-y-4 text-sm text-gray-700">
        <!-- Ảnh -->
        <div v-if="combo.images?.url" class="text-center">
          <img :src="combo.images.url" alt="Ảnh combo"
            class="w-40 h-40 object-cover rounded-lg mx-auto border shadow-sm" />
          <p class="text-xs mt-1 italic text-gray-500">{{ combo.images.name }}</p>
        </div>

        <!-- Tên combo -->
        <div>
          <strong class="block text-gray-600">Tên combo:</strong>
          <p>{{ combo.comboName }}</p>
        </div>

        <!-- Mô tả -->
        <div>
          <strong class="block text-gray-600">Mô tả:</strong>
          <p>{{ combo.description || '(Không có mô tả)' }}</p>
        </div>

        <!-- Danh mục -->
        <div>
          <strong class="block text-gray-600">Danh mục:</strong>
          <p>{{ getCategoryName(combo.foodCategoryId) }}</p>
        </div>

        <!-- Giá -->
        <div>
          <strong class="block text-gray-600">Giá:</strong>
          <template v-if="combo.promotion">
            <p>
              <span class="line-through text-gray-400 mr-2">
                {{ formatPrice(combo.price) }}
              </span>
              <span class="text-red-600 font-bold">
                {{ formatPrice(getDiscountedPrice(combo)) }}
              </span>
              <span class="ml-2 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                -{{ combo.promotion.discountAmount }}{{ combo.promotion.type === 'Percentage' ? '%' : '₫' }}
              </span>
            </p>
          </template>
          <template v-else>
            <p>{{ formatPrice(combo.price) }}</p>
          </template>
        </div>

        <!-- Khuyến mãi -->
        <div>
          <strong class="block text-gray-600">Khuyến mãi:</strong>
          <p v-if="combo.promotion" class="text-pink-600">
            {{ combo.promotion.promotionName }}
          </p>
          <p v-else class="text-gray-400 italic">(Không áp dụng)</p>
        </div>

        <!-- Trạng thái -->
        <div>
          <strong class="block text-gray-600">Trạng thái:</strong>
          <p :class="combo.status ? 'text-green-600' : 'text-gray-500'">
            {{ combo.status ? 'Hiển thị' : 'Ẩn' }}
          </p>
        </div>

        <!-- Kho -->
        <div>
          <strong class="block text-gray-600">Kho:</strong>
          <p>{{ combo.quantity }}</p>
        </div>

        <!-- Danh sách món ăn -->
        <div>
          <strong class="block text-gray-600">🍽️ Món trong combo:</strong>
          <ul class="mt-1 space-y-2">
            <li v-for="item in combo.comboDetails" :key="item.food.foodId"
              class="flex items-center gap-3 bg-gray-50 p-2 rounded">
              <img v-if="item.food.images?.url" :src="item.food.images.url" alt="food"
                class="w-10 h-10 object-cover rounded border" />
              <div class="flex-1">
                <p class="font-medium text-gray-800">{{ item.food.foodName }}</p>
                <p class="text-xs text-gray-500">
                  {{ formatPrice(item.food.price) }} x {{ item.quantity }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="text-center text-gray-500 py-10 text-lg">
        <span class="animate-pulse">Đang tải dữ liệu combo...</span>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-right">
        <button @click="emit('close')" class="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded">
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useComboStore } from "@/stores/comboStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { formatPrice } from "@/utils/format";
import { useToast } from "vue-toastification";

const props = defineProps({
  isOpen: Boolean,
  comboId: Number,
});
const emit = defineEmits(["close"]);

const comboStore = useComboStore();
const categoryStore = useCategoryStore();
const toast = useToast();

const combo = ref(null);

const getCategoryName = (id) => {
  return categoryStore.categories.find((c) => c.foodCategoryId === id)?.categoryName || "---";
};

watch(
  () => props.comboId,
  async (id) => {
    if (!id) return;
    try {
      await categoryStore.fetchCategories();
      await comboStore.fetchComboById(id);
      combo.value = comboStore.selectedCombo;
    } catch (err) {
      toast.error("Lỗi khi tải combo");
    }
  },
  { immediate: true }
);

const getDiscountedPrice = (combo) => {
  if (!combo.promotion) return combo.price;
  if (combo.promotion.type === "Percentage") {
    return combo.price - (combo.price * combo.promotion.discountAmount) / 100;
  }
  if (combo.promotion.type === "Amount") {
    return combo.price - combo.promotion.discountAmount;
  }
  return combo.price;
};
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

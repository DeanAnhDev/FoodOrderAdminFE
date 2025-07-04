<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div class="bg-white w-[1000px] max-h-[90vh] rounded-lg p-6 overflow-y-auto shadow-lg">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Cập nhật Combo</h2>
        <button @click="$emit('close')" class="text-gray-600 hover:text-black">&times;</button>
      </div>

      <!-- Form body -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Thông tin combo -->
        <div class="space-y-4">
          <input v-model="form.comboName" placeholder="Tên combo" class="w-full px-4 py-2 border rounded-md" />

          <select v-model="form.foodCategoryId" class="w-full px-4 py-2 border rounded-md">
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.foodCategoryId">
              {{ cat.categoryName }}
            </option>
          </select>

          <select v-model="form.status" class="w-full px-4 py-2 border rounded-md">
            <option :value="true">Hiển thị</option>
            <option :value="false">Ẩn</option>
          </select>

          <select v-model="form.isOutOfStock" class="w-full px-4 py-2 border rounded-md">
            <option :value="false">Còn hàng</option>
            <option :value="true">Hết hàng</option>
          </select>

          <textarea v-model="form.description" placeholder="Mô tả combo" class="w-full px-4 py-2 border rounded-md" />

          <input v-model.number="form.price" type="number" placeholder="Giá combo" class="w-full px-4 py-2 border rounded-md" />

          <input type="file" @change="handleImageUpload" />
          <div v-if="form.images?.url" class="mt-2">
            <img :src="form.images.url" alt="combo" class="w-32 h-32 object-cover rounded-md" />
          </div>
        </div>

        <!-- Danh sách món ăn có thể thêm -->
        <div>
          <h3 class="text-lg font-medium mb-2">Danh sách món ăn</h3>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <div v-for="food in filteredAvailableFoods" :key="food.foodId" class="flex items-center justify-between p-2 border rounded">
              <div>
                <p class="font-semibold">{{ food.foodName }}</p>
                <p class="text-sm text-gray-500">{{ formatPrice(food.price) }}</p>
              </div>
              <button @click="addFoodToCombo(food)" class="text-blue-500 hover:underline">Thêm</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách món đã chọn -->
      <div class="mt-6">
        <h3 class="text-lg font-medium mb-2">Món đã chọn trong combo</h3>
        <table class="w-full text-sm border">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2">Ảnh</th>
              <th class="p-2">Tên món</th>
              <th class="p-2">Giá</th>
              <th class="p-2">Trạng thái</th>
              <th class="p-2">Kho</th>
              <th class="p-2">Số lượng</th>
              <th class="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in form.foods" :key="item.foodId">
              <td class="p-2">
                <img :src="getFood(item.foodId)?.images?.thumbnailUrl" alt="food" class="w-12 h-12 object-cover rounded" />
              </td>
              <td class="p-2">{{ getFood(item.foodId)?.foodName || '---' }}</td>
              <td class="p-2">{{ formatPrice(getFood(item.foodId)?.price || 0) }}</td>
              <td class="p-2">
                <span :class="getFood(item.foodId)?.status ? 'text-green-600' : 'text-gray-500'">
                  {{ getFood(item.foodId)?.status ? 'Hiển thị' : 'Ẩn' }}
                </span>
              </td>
              <td class="p-2">
                <span :class="getFood(item.foodId)?.isOutOfStock ? 'text-red-600' : 'text-blue-600'">
                  {{ getFood(item.foodId)?.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
                </span>
              </td>
              <td class="p-2">
                <input type="number" v-model.number="item.quantity" min="1" class="border px-2 py-1 w-20 rounded" />
              </td>
              <td class="p-2">
                <button @click="removeFood(item.foodId)" class="text-red-500 hover:underline">Xoá</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Nút cập nhật -->
      <div class="mt-6 text-right">
        <button @click="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow">
          Cập nhật combo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { useUploadStore } from '@/stores/uploadStore'
import { useComboStore } from '@/stores/comboStore'
import { formatPrice } from '@/utils/format'
import { useToast } from 'vue-toastification'

const props = defineProps({ isOpen: Boolean, comboId: Number })
const emit = defineEmits(['close', 'updated'])

const toast = useToast()
const categoryStore = useCategoryStore()
const uploadStore = useUploadStore()
const comboStore = useComboStore()

const form = ref({
  comboId: null,
  comboName: '',
  foodCategoryId: '',
  price: 0,
  description: '',
  images: null,
  status: true,
  isOutOfStock: false,
  foods: []
})

const filteredAvailableFoods = computed(() => {
  const selectedIds = form.value.foods.map(f => f.foodId)
  return comboStore.allFoods.filter(food => {
    return (
      !selectedIds.includes(food.foodId) &&
      food.status === true &&
      food.isOutOfStock === false
    )
  })
})

const getFood = (id) => {
  return comboStore.allFoods.find(f => f.foodId === id) || comboStore.comboDetails.find(d => d.food?.foodId === id)?.food
}

const addFoodToCombo = (food) => {
  if (!form.value.foods.some(f => f.foodId === food.foodId)) {
    form.value.foods.push({ foodId: food.foodId, quantity: 1 })
  }
}

const removeFood = (id) => {
  form.value.foods = form.value.foods.filter(f => f.foodId !== id)
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  try {
    const oldId = form.value.images?.id
    if (oldId) await uploadStore.remove(oldId)
    const uploaded = await uploadStore.upload(file, crypto.randomUUID())
    form.value.images = uploaded
  } catch (err) {
    toast.error('Tải ảnh thất bại')
  }
}

const submit = async () => {
  if (!form.value.images) return toast.error('Vui lòng thêm ảnh combo');

  // Kiểm tra trạng thái và kho của từng món trong combo
  const invalidFoods = form.value.foods.filter(f => {
    const food = comboStore.allFoods.find(item => item.foodId === f.foodId);
    return !food?.status || food?.isOutOfStock;
  });

  if (invalidFoods.length > 0) {
    toast.error('Combo chứa món đang bị ẩn hoặc hết hàng. Vui lòng kiểm tra lại!');
    return;
  }

  try {
    await comboStore.updateCombo(form.value);
    toast.success('Cập nhật thành công');
    emit('updated');
    emit('close');
  } catch (err) {
    toast.error('Có lỗi xảy ra khi cập nhật');
  }
};


watch(() => props.comboId, async (id) => {
  if (!id) return

  try {
    await comboStore.fetchComboById(id)
    await comboStore.fetchAllFoods()

    const combo = comboStore.selectedCombo
    form.value = {
      comboId: combo.comboId,
      comboName: combo.comboName,
      foodCategoryId: combo.foodCategoryId,
      price: combo.price,
      description: combo.description,
      status: combo.status,
      isOutOfStock: combo.isOutOfStock,
      images: combo.images,
      foods: combo.comboDetails.map(d => ({
        foodId: d.food.foodId,
        quantity: d.quantity
      }))
    }
  } catch (err) {
    toast.error('Lỗi khi tải dữ liệu combo')
  }
}, { immediate: true })
</script>

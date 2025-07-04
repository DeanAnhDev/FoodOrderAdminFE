<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div class="bg-white w-[1000px] max-h-[90vh] rounded-lg p-6 overflow-y-auto shadow-lg">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Thêm Combo mới</h2>
        <button @click="$emit('close')" class="text-gray-600 hover:text-black">&times;</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Form thông tin combo -->
        <div class="space-y-4">
          <input v-model="form.comboName" type="text" placeholder="Tên combo" class="w-full px-4 py-2 border rounded-md" />

          <select v-model="form.foodCategoryId" class="w-full px-4 py-2 border rounded-md">
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.foodCategoryId">
              {{ cat.categoryName }}
            </option>
          </select>

          <textarea v-model="form.description" placeholder="Mô tả combo" class="w-full px-4 py-2 border rounded-md"></textarea>

          <input v-model.number="form.price" type="number" placeholder="Giá combo" class="w-full px-4 py-2 border rounded-md" />

          <input type="file" @change="handleImageUpload" />
          <div v-if="form.images?.url" class="mt-2">
            <img :src="form.images.url" alt="combo" class="w-32 h-32 object-cover rounded-md" />
          </div>
        </div>

        <!-- Danh sách food chưa chọn -->
        <div>
          <h3 class="text-lg font-medium mb-2">Danh sách món ăn</h3>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <div v-for="food in availableFoods" :key="food.foodId" class="flex items-center justify-between p-2 border rounded">
              <div>
                <p class="font-semibold">{{ food.foodName }}</p>
                <p class="text-sm text-gray-500">{{ formatPrice(food.price) }}</p>
              </div>
              <button @click="addFoodToCombo(food)" class="text-blue-500 hover:underline">Thêm</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách food đã chọn -->
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

      <div class="mt-6 text-right">
        <button @click="submit" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow">
          Lưu combo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useFoodStore } from '@/stores/foodStore'
import { useComboStore } from '@/stores/comboStore'
import { formatPrice } from '@/utils/format'
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'created'])

const uploadStore = useUploadStore()
const categoryStore = useCategoryStore()
const foodStore = useFoodStore()
const comboStore = useComboStore()

const form = ref({
  comboName: '',
  foodCategoryId: '',
  price: 0,
  description: '',
  images: null,
  foods: []
})

const availableFoods = computed(() => {
  return foodStore.foods.filter(f => {
    const isNotSelected = !form.value.foods.some(i => i.foodId === f.foodId)
    const isVisible = f.status === true
    const isInStock = f.isOutOfStock === false
    return isNotSelected && isVisible && isInStock
  })
})

const getFood = (id) => {
  return foodStore.foods.find(f => f.foodId === id)
}

const addFoodToCombo = (food) => {
  form.value.foods.push({ foodId: food.foodId, quantity: 1 })
}

const removeFood = (id) => {
  form.value.foods = form.value.foods.filter(f => f.foodId !== id)
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const oldId = form.value.images?.id
  if (oldId) await uploadStore.remove(oldId)

  try {
    const imageData = await uploadStore.upload(file, crypto.randomUUID())
    form.value.images = imageData
  } catch (err) {
    console.error(err)
  }
}

const submit = async () => {
  if (!form.value.comboName.trim()) return toast.error('Vui lòng nhập tên combo.')
  if (!form.value.foodCategoryId) return toast.error('Vui lòng chọn danh mục.')
  if (!form.value.price || form.value.price <= 0) return toast.error('Vui lòng nhập giá combo hợp lệ.')
  if (!form.value.description.trim()) return toast.error('Vui lòng nhập mô tả.')
  if (!form.value.images?.url) return toast.error('Vui lòng tải ảnh combo.')
  if (form.value.foods.length === 0) return toast.error('Vui lòng thêm món vào combo.')
  if (form.value.foods.some(f => f.quantity <= 0)) return toast.error('Số lượng phải > 0.')

  try {
    await comboStore.createCombo(form.value)
    toast.success('Tạo combo thành công!')
    emit('created')
    emit('close')
  } catch (err) {
    console.error(err)
    toast.error('Lỗi khi tạo combo!')
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
  foodStore.fetchFoods()
})
</script>

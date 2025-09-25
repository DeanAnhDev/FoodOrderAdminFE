<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div class="bg-white w-[1000px] max-h-[90vh] rounded-2xl p-6 overflow-y-auto shadow-2xl">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Thêm Combo mới</h2>
        <button @click="handleClose" class="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
      </div>

      <!-- Form Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Cột trái: Nhập thông tin -->
        <div class="space-y-4">
          <!-- Tên combo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tên combo</label>
            <input v-model="form.comboName" type="text" placeholder="Nhập tên combo"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />
          </div>

          <!-- Danh mục -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select v-model="form.foodCategoryId"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400">
              <option value="">Chọn danh mục</option>
              <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.foodCategoryId">
                {{ cat.categoryName }}
              </option>
            </select>
          </div>

          <!-- Khuyến mãi -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Khuyến mãi</label>
            <select v-model="form.promotionId"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition text-gray-700">
              <option :value="null">🎁 Chọn khuyến mãi (tuỳ chọn)</option>
              <option v-for="promo in promotionStore.promotions.filter(p => p.isActive)" :key="promo.promotionId"
                :value="promo.promotionId">
                {{ promo.promotionName }} - Giảm {{ promo.discountAmount }}{{ promo.type === 'Percentage' ? '%' : '₫' }}
              </option>
            </select>
          </div>

          <!-- Mô tả -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả combo</label>
            <textarea v-model="form.description" placeholder="Nhập mô tả..." rows="4"
              class="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring focus:border-blue-400"></textarea>
          </div>

          <!-- Giá combo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Giá combo</label>
            <input v-model.number="form.price" type="number" placeholder="Nhập giá combo"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />
          </div>

          <!-- Số lượng -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Số lượng combo</label>
            <input v-model.number="form.quantity" type="number" placeholder="Nhập số lượng" min="1"
              class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />
          </div>

          <!-- Ảnh combo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh combo</label>
            <div class="flex items-center gap-4">
              <div
                class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                <img v-if="form.images?.url" :src="form.images.url" class="w-full h-full object-cover" />
                <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
              </div>
              <div class="flex flex-col gap-2">
                <input type="file" @change="handleImageUpload" accept="image/*"
                  class="block text-sm text-gray-600 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <p v-if="form.images?.name" class="text-xs text-gray-500 truncate max-w-[180px]">
                  {{ form.images.name }}
                </p>
              </div>
            </div>
          </div>
        </div>


        <!-- Cột phải: Danh sách món ăn -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Danh sách món ăn</h3>

          <input v-model="searchQuery" type="text" placeholder="Tìm món theo tên..."
            class="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400" />

          <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div v-for="food in availableFoods" :key="food.foodId"
              class="flex justify-between items-center p-3 border rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100">
              <div>
                <p class="font-medium">{{ food.foodName }}</p>
                <p class="text-sm text-gray-500">{{ formatPrice(food.price) }}</p>
              </div>
              <button @click="addFoodToCombo(food)" class="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                + Thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách món đã chọn -->
      <div class="mt-10">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Món đã chọn trong combo</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm border rounded-xl overflow-hidden">
            <thead class="bg-gray-100 text-left">
              <tr>
                <th class="p-3">Ảnh</th>
                <th class="p-3">Tên món</th>
                <th class="p-3">Giá</th>
                <th class="p-3">Trạng thái</th>
                <th class="p-3">Số lượng</th>
                <th class="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in form.foods" :key="item.foodId" class="border-t">
                <td class="p-3">
                  <img :src="getFood(item.foodId)?.images?.thumbnailUrl" class="w-12 h-12 object-cover rounded" />
                </td>
                <td class="p-3">{{ getFood(item.foodId)?.foodName || '---' }}</td>
                <td class="p-3">{{ formatPrice(getFood(item.foodId)?.price || 0) }}</td>
                <td class="p-3">
                  <span :class="getFood(item.foodId)?.status ? 'text-green-600' : 'text-gray-400'">
                    {{ getFood(item.foodId)?.status ? 'Hiển thị' : 'Ẩn' }}
                  </span>
                </td>
                <td class="p-3">
                  <input type="number" v-model.number="item.quantity" min="1"
                    class="w-20 px-2 py-1 border rounded focus:outline-none" />
                </td>
                <td class="p-3">
                  <button @click="removeFood(item.foodId)"
                    class="text-red-500 hover:text-red-700 font-medium text-sm">Xoá</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-right">
        <button @click="submit"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow">
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
import { usePromotionStore } from '@/stores/promotionStore'

const promotionStore = usePromotionStore()
const toast = useToast()
const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['close', 'created'])

const searchQuery = ref('')

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
  quantity: 1,
  foods: [],
  promotionId: null
})

const resetForm = () => {
  form.value = {
    comboName: '',
    foodCategoryId: '',
    price: 0,
    description: '',
    images: null,
    quantity: 1,
    foods: [],
    promotionId: null
  }
  searchQuery.value = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const availableFoods = computed(() => {
  return foodStore.foods.filter(f => {
    const isNotSelected = !form.value.foods.some(i => i.foodId === f.foodId)
    const isVisible = f.status === true
    const matchesSearch = f.foodName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return isNotSelected && isVisible && matchesSearch
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
    toast.error('Tải ảnh thất bại')
  }
}

const submit = async () => {
  if (!form.value.comboName.trim()) return toast.error('Vui lòng nhập tên combo.')
  if (!form.value.foodCategoryId) return toast.error('Vui lòng chọn danh mục.')
  if (form.value.price === null || form.value.price < 0) return toast.error('Giá combo không hợp lệ.')
  if (!form.value.description.trim()) return toast.error('Vui lòng nhập mô tả.')
  if (!form.value.images?.url) return toast.error('Vui lòng tải ảnh combo.')
  if (form.value.foods.length === 0) return toast.error('Combo phải có ít nhất 1 món ăn.')
  if (form.value.foods.some(f => !f.quantity || f.quantity < 1)) return toast.error('Số lượng món ăn phải ≥ 1.')
  if (!form.value.quantity || form.value.quantity < 1) return toast.error('Số lượng combo phải ≥ 1.')
  if (form.value.price === null || form.value.price === '' || isNaN(form.value.price)) {
    return toast.error('Vui lòng nhập giá combo.');
  }

  if (form.value.price <= 0) {
    return toast.error('Giá combo không được nhỏ hơn 0.');
  }

  try {
    // Chuẩn bị data theo đúng DTO format
    const comboData = {
      comboName: form.value.comboName.trim(),
      foodCategoryId: parseInt(form.value.foodCategoryId),
      price: parseFloat(form.value.price),
      description: form.value.description.trim(),
      images: form.value.images,
      quantity: parseInt(form.value.quantity),
      foods: form.value.foods.map(f => ({
        foodId: f.foodId,
        quantity: parseInt(f.quantity)
      })),
      promotionId: form.value.promotionId // null hoặc số nguyên
    }

    await comboStore.createCombo(comboData)
    toast.success('Tạo combo thành công!')
    emit('created')
    emit('close')
    resetForm()
  } catch (err) {
    // Nếu backend trả về message thì show message đó
    const backendMessage = err.response?.data?.error || 'Cập nhật thất bại!'
    toast.error(backendMessage)
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
  foodStore.fetchFoods({
    page: 1,
    pageSize: 1000,
  })
  promotionStore.fetchPromotions()
})
</script>

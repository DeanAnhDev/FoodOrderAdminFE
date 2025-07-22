<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
    <div class="bg-white w-[1000px] max-h-[90vh] rounded-2xl p-6 overflow-y-auto shadow-2xl ring-1 ring-black/10">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6 border-b pb-3">
        <h2 class="text-2xl font-bold text-gray-800">Cập nhật Combo</h2>
        <button @click="$emit('close')" class="text-2xl font-semibold text-gray-500 hover:text-black">&times;</button>
      </div>

      <!-- Form body -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Thông tin combo -->
        <div class="space-y-4">
          <input v-model="form.comboName" placeholder="Tên combo"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <select v-model="form.foodCategoryId"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.foodCategoryId">
              {{ cat.categoryName }}
            </option>
          </select>

          <div class="flex gap-4">
            <select v-model="form.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option :value="true">Hiển thị</option>
              <option :value="false">Ẩn</option>
            </select>

            <input v-model.number="form.quantity" type="number" min="0" placeholder="Số lượng còn lại"
              class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />

          </div>

          <textarea v-model="form.description" placeholder="Mô tả combo"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[80px]" />

          <input v-model.number="form.price" type="number" placeholder="Giá combo"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <!-- Ảnh combo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ảnh combo</label>

            <div class="flex items-center gap-4">
              <!-- Khung hiển thị ảnh -->
              <div
                class="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                <img v-if="form.images?.url" :src="form.images.url || form.images.url"
                  class="w-full h-full object-cover" alt="Ảnh combo" />
                <span v-else class="text-xs text-gray-400">Chưa có ảnh</span>
              </div>

              <!-- Upload & tên file -->
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

        <!-- Danh sách món ăn có thể thêm -->
        <!-- Danh sách món ăn có thể thêm -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Danh sách món ăn</h3>

          <!-- Tìm kiếm -->
          <input v-model="searchQuery" type="text" placeholder="Tìm món theo tên..."
            class="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div v-for="food in filteredAvailableFoods" :key="food.foodId"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
              <div>
                <p class="font-medium text-gray-800">{{ food.foodName }}</p>
                <p class="text-sm text-gray-500">{{ formatPrice(food.price) }}</p>
              </div>
              <button @click="addFoodToCombo(food)" class="text-blue-600 hover:underline font-medium">+ Thêm</button>
            </div>
          </div>
        </div>

      </div>

      <!-- Danh sách món đã chọn -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Món đã chọn trong combo</h3>
        <div class="overflow-x-auto rounded-lg border">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-100 text-gray-700">
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
              <tr v-for="item in form.foods" :key="item.foodId" class="border-t hover:bg-gray-50">
                <td class="p-3">
                  <img :src="getFood(item.foodId)?.images?.thumbnailUrl" alt="food"
                    class="w-12 h-12 object-cover rounded-md" />
                </td>
                <td class="p-3">{{ getFood(item.foodId)?.foodName || '---' }}</td>
                <td class="p-3">{{ formatPrice(getFood(item.foodId)?.price || 0) }}</td>
                <td class="p-3">
                  <span :class="getFood(item.foodId)?.status ? 'text-green-600' : 'text-gray-500'">
                    {{ getFood(item.foodId)?.status ? 'Hiển thị' : 'Ẩn' }}
                  </span>
                </td>
                <td class="p-3">
                  <input type="number" v-model.number="item.quantity" min="1"
                    class="border px-2 py-1 w-20 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </td>
                <td class="p-3">
                  <button @click="removeFood(item.foodId)" class="text-red-600 hover:underline font-medium">Xoá</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Nút cập nhật -->
      <div class="mt-6 text-right">
        <button @click="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition">
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
  quantity: 0,
  description: '',
  images: null,
  status: true,
  foods: []
})

const searchQuery = ref('')

const filteredAvailableFoods = computed(() => {
  const selectedIds = form.value.foods.map(f => f.foodId)
  return comboStore.allFoods.filter(food => {
    const matchesSearch = food.foodName.toLowerCase().includes(searchQuery.value.toLowerCase())
    return (
      !selectedIds.includes(food.foodId) &&
      food.status === true &&
      matchesSearch
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
  if (!form.value.comboName.trim()) {
    return toast.error('Vui lòng nhập tên combo.');
  }

  if (!form.value.foodCategoryId) {
    return toast.error('Vui lòng chọn danh mục.');
  }

  if (form.value.price === null || form.value.price < 0) {
    return toast.error('Giá combo không được nhỏ hơn 0.');
  }

  if (!form.value.description.trim()) {
    return toast.error('Vui lòng nhập mô tả combo.');
  }

  if (!form.value.images?.url) {
    return toast.error('Vui lòng thêm ảnh combo.');
  }

  if (form.value.foods.length === 0) {
    return toast.error('Combo phải có ít nhất 1 món ăn.');
  }

  if (form.value.foods.some(f => !f.quantity || f.quantity < 1)) {
    return toast.error('Số lượng mỗi món ăn phải từ 1 trở lên.');
  }

  if (form.value.quantity === null || form.value.quantity < 0) {
    return toast.error('Số lượng combo không được nhỏ hơn 0.');
  }


  // Kiểm tra trạng thái và kho của từng món ăn trong combo
  const invalidFoods = form.value.foods.filter(f => {
    const food = comboStore.allFoods.find(item => item.foodId === f.foodId);
    return !food?.status || food?.isOutOfStock;
  });

  if (invalidFoods.length > 0) {
    return toast.error('Combo chứa món đang bị ẩn hoặc hết hàng. Vui lòng kiểm tra lại!');
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
      quantity: combo.quantity,
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

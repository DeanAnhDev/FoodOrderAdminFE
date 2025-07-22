<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Quản lý Combo</h1>
      <button @click="openAddModal"
        class="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded shadow-md text-sm font-semibold">
        + Thêm mới
      </button>
    </div>

    <!-- Bộ lọc -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <input v-model="filters.name" type="text" placeholder="Tìm theo tên combo"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200" />
      <select v-model="filters.categoryName"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200">
        <option value="">Tất cả danh mục</option>
        <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.categoryName">
          {{ cat.categoryName }}
        </option>
      </select>
      <select v-model="filters.status"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200">
        <option value="">Tất cả trạng thái</option>
        <option value="true">Hiển thị</option>
        <option value="false">Ẩn</option>
      </select>
      <select v-model="filters.isOutOfStock"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200">
        <option value="">Tất cả kho</option>
        <option value="false">Còn hàng</option>
        <option value="true">Hết hàng</option>
      </select>
      <select v-model="filters.sortOrder"
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200">
        <option value="desc">Mới nhất</option>
        <option value="asc">Cũ nhất</option>
      </select>
    </div>

    <!-- Nút tìm -->
    <div>
      <button @click="search"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow text-sm font-semibold">
        Tìm kiếm
      </button>
    </div>

    <!-- Bảng -->
    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200 bg-white">
        <thead class="bg-gray-100 text-sm text-left text-gray-600 font-semibold">
          <tr>
            <th class="px-6 py-3">Ảnh</th>
            <th class="px-6 py-3">Tên Combo</th>
            <th class="px-6 py-3">Danh mục</th>
            <th class="px-6 py-3">Slug</th>
            <th class="px-6 py-3">Giá</th>
            <th class="px-6 py-3">Trạng thái</th>
            <th class="px-6 py-3">Kho</th>
            <th class="px-6 py-3">Đã bán</th>
            <th class="px-6 py-3">Ngày tạo</th>
            <th class="px-6 py-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="combo in comboStore.combos" :key="combo.comboId" class="hover:bg-gray-50 transition">
            <td class="px-6 py-3">
              <img :src="combo.images?.url" alt="combo" class="w-14 h-14 object-cover rounded-md border" />
            </td>
            <td class="px-6 py-3 font-semibold text-gray-800">{{ combo.comboName }}</td>
            <td class="px-6 py-3 text-gray-700">{{ getCategoryNameById(combo.foodCategoryId) }}</td>
            <td class="px-6 py-3 italic text-gray-500">{{ combo.slug }}</td>
            <td class="px-6 py-3 text-gray-800 font-medium">{{ formatPrice(combo.price) }}</td>
            <td class="px-6 py-3">
              <span :class="combo.status ? 'text-green-600 font-medium' : 'text-gray-500'">
                {{ combo.status ? 'Hiển thị' : 'Ẩn' }}
              </span>
            </td>
            <td class="px-6 py-3">
                {{ combo.quantity}}
            </td>
            <td class="px-6 py-3">{{ combo.sold || 0 }}</td>
            <td class="px-6 py-3">{{ formatDate(combo.createdAt) }}</td>
            <td class="px-6 py-3 text-center">
              <div class="flex justify-center gap-3">
                <button @click="openViewModal(combo.comboId)" class="text-blue-500 hover:text-blue-600 text-lg"
                  title="Xem">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button @click="openUpdateModal(combo.comboId)" class="text-yellow-500 hover:text-yellow-600 text-lg"
                  title="Sửa">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <div class="flex justify-end items-center mt-6 gap-4 text-sm font-medium">
      <button @click="prevPage" :disabled="page <= 1"
        class="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50">Trước</button>
      <span>Trang {{ page }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page >= totalPages"
        class="px-3 py-1 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50">Sau</button>
    </div>

    <!-- Modal -->
    <AddComboModal :isOpen="showAddModal" @close="showAddModal = false" @created="fetchCombos" />

    <UpdateComboModal v-if="showUpdateModal" :isOpen="showUpdateModal" :comboId="selectedComboId"
      @close="closeUpdateModal" @updated="fetchCombos" />

    <ViewComboModal v-if="showViewModal" :isOpen="showViewModal" :comboId="selectedComboId"
      @close="showViewModal = false" />

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useComboStore } from '@/stores/comboStore'
import { useCategoryStore } from '@/stores/categoryStore'
import AddComboModal from '@/components/combocomponent/AddComboModal.vue'
import UpdateComboModal from '@/components/combocomponent/UpdateComboModal.vue'
import { formatPrice, formatDate } from '@/utils/format'
import ViewComboModal from '@/components/combocomponent/ViewComboModal.vue'


const showViewModal = ref(false)

const openViewModal = (id) => {
  selectedComboId.value = id
  showViewModal.value = true
}


const getCategoryNameById = (id) => {
  return categoryStore.categories.find(cat => cat.foodCategoryId === id)?.categoryName || '---'
}
const comboStore = useComboStore()
const categoryStore = useCategoryStore()

const filters = ref({
  name: '',
  categoryName: '',
  status: '',
  isOutOfStock: '',
  sortOrder: 'desc'
})

const page = computed({
  get: () => comboStore.pagination.pageNumber,
  set: (val) => (comboStore.pagination.pageNumber = val)
})
const totalPages = computed(() => comboStore.pagination.totalPages)

const search = () => {
  const query = {
    Page: page.value,
    PageSize: comboStore.pagination.pageSize,
    Name: filters.value.name,
    CategoryName: filters.value.categoryName,
    Status: filters.value.status !== '' ? filters.value.status === 'true' : null,
    IsOutOfStock: filters.value.isOutOfStock !== '' ? filters.value.isOutOfStock === 'true' : null,
    SortOrder: filters.value.sortOrder
  }
  comboStore.fetchCombos(query)
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    search()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    search()
  }
}

const fetchCombos = () => {
  search()
}

// Modal logic
const showAddModal = ref(false)
const showUpdateModal = ref(false)
const selectedComboId = ref(null)

const openAddModal = () => {
  showAddModal.value = true
}

const openUpdateModal = async (id) => {
  selectedComboId.value = id
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
  selectedComboId.value = null
}

onMounted(() => {
  categoryStore.fetchCategories()
  fetchCombos()
})
</script>

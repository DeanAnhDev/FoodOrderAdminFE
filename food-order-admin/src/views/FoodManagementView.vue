<template>
    <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-800">Quản lý món ăn</h1>
            <button @click="openAddModal"
                class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow text-sm font-medium">
                + Thêm món ăn
            </button>
        </div>

        <!-- Bộ lọc -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
            <input v-model="filters.name" type="text" placeholder="Tìm theo tên món..."
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200" />

            <select v-model="filters.categoryName"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Tất cả danh mục</option>
                <option v-for="cat in categoryStore.categories" :key="cat.foodCategoryId" :value="cat.categoryName">
                    {{ cat.categoryName }}
                </option>
            </select>

            <select v-model="filters.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Tất cả trạng thái</option>
                <option value="true">Đang bán</option>
                <option value="false">Ngừng bán</option>
            </select>

            <select v-model="filters.isOutOfStock"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Tất cả kho</option>
                <option value="false">Còn hàng</option>
                <option value="true">Hết hàng</option>
            </select>

            <select v-model="filters.sortOrder"
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
            </select>
        </div>

        <!-- Nút tìm kiếm -->
        <div class="mb-6">
            <button @click="search"
                class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow text-sm font-medium">
                Tìm kiếm
            </button>
        </div>


        <!-- Bảng danh sách -->
        <div class="overflow-x-auto rounded-lg shadow">
            <table class="min-w-full divide-y divide-gray-200 bg-white">
                <thead class="bg-gray-50">
                    <tr class="text-gray-600 text-sm font-medium text-left">
                        <th class="px-6 py-3">Ảnh</th>
                        <th class="px-6 py-3">Tên món</th>
                        <th class="px-6 py-3">Slug</th>
                        <th class="px-6 py-3">Danh mục</th>
                        <th class="px-6 py-3">Giá</th>
                        <th class="px-6 py-3">Trạng thái</th>
                        <th class="px-6 py-3">Kho</th>
                        <th class="px-6 py-3">Đã bán</th>
                        <th class="px-6 py-3">Ngày tạo</th>
                        <th class="px-6 py-3 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-sm">
                    <tr v-for="food in foodStore.foods" :key="food.foodId" class="hover:bg-gray-50 transition">
                        <td class="px-6 py-3">
                            <img :src="food.images?.url" alt="food" class="w-14 h-14 object-cover rounded-md border" />
                        </td>
                        <td class="px-6 py-3 font-semibold text-gray-800">{{ food.foodName }}</td>
                        <td class="px-6 py-3 text-gray-600 italic">{{ food.slug }}</td>
                        <td class="px-6 py-3 text-gray-700">
                            {{
                                categoryStore.categories.find(cat => cat.foodCategoryId ===
                                    food.foodCategoryId)?.categoryName || '---'
                            }}
                        </td>
                        <td class="px-6 py-3 text-gray-800">{{ formatPrice(food.price) }}</td>
                        <td class="px-6 py-3">
                            <span :class="food.status ? 'text-green-600 font-medium' : 'text-gray-500'">
                                {{ food.status ? 'Đang bán' : 'Ngừng bán' }}
                            </span>
                        </td>
                        <td class="px-6 py-3">
                            <span :class="food.isOutOfStock ? 'text-red-600' : 'text-green-600'">
                                {{ food.isOutOfStock ? 'Hết hàng' : 'Còn hàng' }}
                            </span>
                        </td>
                        <td class="px-6 py-3 text-gray-700">{{ food.sold || 0 }}</td>
                        <td class="px-6 py-3 text-gray-700">{{ formatDate(food.createdAt) }}</td>
                        <td class="px-6 py-3 text-center">
                            <div class="flex justify-center gap-2">
                                <button @click="viewFood(food)" class="text-blue-500 hover:text-blue-700 transition"
                                    title="Xem">
                                    <i class="fa-solid fa-eye"></i>
                                </button>
                                <button @click="editFood(food)" class="text-yellow-500 hover:text-yellow-600 transition"
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
        <div class="flex justify-end items-center mt-4 gap-4">
            <button @click="prevPage" :disabled="page <= 1" class="px-3 py-1 border rounded">
                Trước
            </button>
            <span>Trang {{ page }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="page >= totalPages" class="px-3 py-1 border rounded">
                Sau
            </button>
        </div>
    </div>

    <AddFoodModal :isOpen="showAddModal" @close="showAddModal = false" @created="fetchData" />
    <UpdateFoodModal :isOpen="showEditModal" :food="selectedFood" @close="showEditModal = false"
        @updated="foodStore.fetchFoods" />

    <ViewFoodModal :isOpen="showViewModal" :food="viewingFood" @close="showViewModal = false" />


</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFoodStore } from '@/stores/foodStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { formatPrice, formatDate } from '@/utils/format'
import AddFoodModal from '@/components/foodcomponent/AddFoodModal.vue'
import UpdateFoodModal from '@/components/foodcomponent/UpdateFoodModal.vue'
import ViewFoodModal from '@/components/foodcomponent/ViewFoodModal.vue'

const foodStore = useFoodStore()
const categoryStore = useCategoryStore()

const filters = ref({
    name: '',
    categoryName: '',
    status: '',
    isOutOfStock: '',
    sortOrder: 'desc'
})
const fetchData = () => {
    foodStore.fetchFoods()
}
const page = computed({
    get: () => foodStore.pagination.page,
    set: (val) => foodStore.setPage(val)
})

const totalPages = computed(() => foodStore.pagination.totalPages)

const search = () => {
    foodStore.setFilters({
        ...filters.value,
        status: filters.value.status !== '' ? filters.value.status === 'true' : null,
        isOutOfStock: filters.value.isOutOfStock !== '' ? filters.value.isOutOfStock === 'true' : null
    })
    foodStore.setPage(1)
    foodStore.fetchFoods()
}

const prevPage = () => {
    if (page.value > 1) {
        page.value--
        foodStore.fetchFoods()
    }
}

const nextPage = () => {
    if (page.value < totalPages.value) {
        page.value++
        foodStore.fetchFoods()
    }
}

const showAddModal = ref(false)

const openAddModal = () => {
    showAddModal.value = true
}

const showViewModal = ref(false)
const viewingFood = ref(null)

const viewFood = (food) => {
    viewingFood.value = food
    showViewModal.value = true
}

const showEditModal = ref(false)
const selectedFood = ref(null)

const editFood = (food) => {
    selectedFood.value = food
    showEditModal.value = true
}


onMounted(() => {
    categoryStore.fetchCategories()
    foodStore.fetchFoods()
})
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">Quản lý danh mục món ăn</h1>
      <button @click="openAddModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow text-sm font-medium">
        + Thêm danh mục
      </button>
    </div>

    <div class="mb-4">
      <input v-model="searchTerm" placeholder="Tìm theo tên danh mục..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200" />
    </div>

    <div class="overflow-x-auto rounded-lg shadow">
      <table class="min-w-full divide-y divide-gray-200 bg-white">
        <thead class="bg-gray-50">
          <tr class="text-gray-600 text-sm font-medium text-left">
            <th class="px-6 py-3">STT</th>
            <th class="px-6 py-3">Tên danh mục</th>
            <th class="px-6 py-3">Slug</th>
            <th class="px-6 py-3">Mô tả</th>
            <th class="px-6 py-3">Hình ảnh</th>
            <th class="px-6 py-3 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="(category, index) in filteredCategories" :key="category.foodCategoryId"
            class="hover:bg-gray-50 transition">
            <td class="px-6 py-3 font-semibold text-gray-700">{{ index + 1 }}</td>

            <td class="px-6 py-3 text-gray-800">{{ category.categoryName }}</td>
            <td class="px-6 py-3 text-gray-600 italic">{{ category.slug }}</td>
            <td class="px-6 py-3 text-gray-700">{{ category.description }}</td>
            <td class="px-6 py-3">
              <img :src="category.images?.url" alt="img" class="w-12 h-12 object-cover rounded-md border" />
            </td>
            <td class="px-6 py-3 text-center">
              <div class="flex justify-center gap-2">
                <button @click="viewCategory(category)" class="text-blue-500 hover:text-blue-700 transition"
                  title="Xem">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <button @click="editCategory(category)" class="text-yellow-500 hover:text-yellow-600 transition"
                  title="Sửa">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button @click="deleteCategory(category.foodCategoryId)"
                  class="text-red-500 hover:text-red-600 transition" title="Xoá">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>


  <AddCategoryModal :isOpen="showAddModal" :categoryId="selectedCategoryId" @close="showAddModal = false"
    @created="fetchData" />

  <EditCategoryModal :isOpen="showEditModal" :categoryData="editingCategory" @close="showEditModal = false"
    @updated="store.fetchCategories" />
    <CategoryDetailModal
  :isOpen="showDetailModal"
  :category="selectedCategory"
  @close="showDetailModal = false"
/>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import AddCategoryModal from '@/components/categorycomponent/AddCategoryModal.vue'
import EditCategoryModal from '@/components/categorycomponent/EditCategoryModal.vue'
import CategoryDetailModal from '@/components/categorycomponent/CategoryDetailModal.vue'
const store = useCategoryStore()
const searchTerm = ref('')

const showAddModal = ref(false)
const selectedCategoryId = ref(null)

const showEditModal = ref(false)
const editingCategory = ref(null)

const showDetailModal = ref(false)
const selectedCategory = ref({})

const fetchData = async () => {
  await store.fetchCategories()
}

onMounted(fetchData)


const filteredCategories = computed(() => {
  return store.categories.filter(cat =>
    cat.categoryName.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const openAddModal = () => {
  selectedCategoryId.value = null
  showAddModal.value = true
}

const editCategory = (category) => {
  editingCategory.value = category
  showEditModal.value = true
}

const deleteCategory = async (id) => {
  if (confirm('Bạn có chắc muốn xoá danh mục này?')) {
    await store.deleteCategory(id)
    await store.fetchCategories()
  }
}

const viewCategory = (category) => {
  selectedCategory.value = category
  showDetailModal.value = true
}
</script>

<!-- src/components/CategoryDetailModal.vue -->
<template>
    <div v-if="isOpen" class="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
       <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 backdrop-blur-none">

            <h2 class="text-xl font-bold mb-4">Chi tiết danh mục</h2>

            <div class="mb-3">
                <label class="text-sm font-medium text-gray-500">Tên danh mục:</label>
                <p class="text-base font-semibold">{{ category.categoryName }}</p>
            </div>

            <div class="mb-3">
                <label class="text-sm font-medium text-gray-500">Mô tả:</label>
                <p class="text-base whitespace-pre-wrap">{{ category.description || 'Không có mô tả' }}</p>
            </div>

            <div class="mb-3">
                <label class="text-sm font-medium text-gray-500">Ảnh đại diện:</label>
                <div v-if="category.images?.url" class="mt-2">
                    <img :src="category.images.thumbnailUrl || category.images.url" alt="Ảnh danh mục"
                        class="w-32 h-32 object-cover border rounded" />
                </div>
                <p v-else class="text-gray-400 italic mt-1">Chưa có ảnh</p>
            </div>

            <div class="flex justify-end mt-4">
                <button @click="emit('close')" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">
                    Đóng
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: Boolean,
    category: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])
</script>

<template>
  <nav class="flex items-center justify-between bg-white pr-[15px] py-2 h-14 px-4 shadow">
    <!-- Left: Menu & Search -->
    <div class="flex items-center gap-[10px]">
      <!-- Icon menu (3 gạch ngang) -->
      <button
        v-if="showPinSidebar"
        class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow"
        @click="$emit('toggle-pin-sidebar')"
      >
        <i class="fa-solid fa-bars text-base text-gray-700"></i>
      </button>
      <button
        v-else
        class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow"
        @click="$emit('toggle-sidebar')"
      >
        <i class="fa-solid fa-bars text-base text-gray-700"></i>
      </button>
      <!-- Icon tìm kiếm (kính lúp) -->
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow">
        <i class="fa-solid fa-magnifying-glass text-sm text-gray-700"></i>
      </button>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center pl-2 gap-[10px]">
      <!-- Nút chuyển chế độ sáng/tối -->
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow">
        <i :class="'fa-solid fa-moon text-gray-700 text-sm'"></i>
      </button>
      <!-- Icon cài đặt -->
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow">
        <i class="fa-solid fa-gear text-base text-gray-700"></i>
      </button>
      <!-- Icon thông báo có chấm tròn màu xanh -->
      <div class="relative">
        <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow">
          <i class="fa-solid fa-bell text-base text-gray-700"></i>
        </button>
        <span
          class="absolute top-1 right-1 block w-2 h-2 bg-green-500 rounded-full ring-2 ring-white"
        ></span>
      </div>
      <!-- Icon tài khoản người dùng -->
      <button class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow">
        <i class="fa-solid fa-user-circle text-base text-gray-700"></i>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  showPinSidebar: Boolean,
  sidebarPinned: Boolean,
})
</script>

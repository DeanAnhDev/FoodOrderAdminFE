<template>
  <div class="layout-container">
    <Navbar
      @toggle-sidebar="toggleSidebar"
      @toggle-pin-sidebar="togglePinSidebar"
      :showPinSidebar="!isMobile"
      :sidebarPinned="sidebarPinned"
      :class="[
        { 'ml-[230px]': !isMobile && sidebarPinned },
        'transition-all duration-300 ease-in-out',
      ]"
    />
    <div class="main-content">
      <!-- Overlay chỉ hiện trên mobile khi sidebar mở -->
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 z-40 bg-gray bg-opacity-40 backdrop-blur-sm transition-opacity"
        @click="sidebarOpen = false"
      ></div>
      <!-- Sidebar luôn hiện trên desktop, toggle trên mobile hoặc desktop nếu sidebarPinned -->
      <Sidebar
        :isOpen="isMobile ? sidebarOpen : sidebarPinned"
        :navbarHeight="navbarHeight"
        :isMobile="isMobile"
        @close="sidebarOpen = false"
      />
      <!-- Main content -->
      <div
        class="page-content transition-all duration-300 ease-in-out"
        :class="{ 'ml-[230px]': !isMobile && sidebarPinned }"
      >
        <Main />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
import Main from './Main.vue'

const sidebarOpen = ref(true)
const sidebarPinned = ref(true)
const navbarHeight = 56 // 14 * 4px (h-14)
const isMobile = ref(window.innerWidth <= 1024)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 1024
  if (!isMobile.value) {
    sidebarOpen.value = true
    // Giữ trạng thái sidebarPinned khi resize
  }
}
const toggleSidebar = () => {
  // Chỉ cho phép toggle trên mobile
  if (isMobile.value) sidebarOpen.value = !sidebarOpen.value
}
const togglePinSidebar = () => {
  // Chỉ cho phép toggle trên desktop
  if (!isMobile.value) sidebarPinned.value = !sidebarPinned.value
}
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<template>
  <nav class="flex items-center justify-between bg-white pr-[15px] py-2 h-14 px-4 shadow">
    <!-- Left: Menu & Search -->
    <div class="flex items-center gap-[10px]">
      <!-- Icon menu (3 gạch ngang) -->
      <button v-if="showPinSidebar" class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow"
        @click="$emit('toggle-pin-sidebar')">
        <i class="fa-solid fa-bars text-base text-gray-700"></i>
      </button>
      <button v-else class="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow"
        @click="$emit('toggle-sidebar')">
        <i class="fa-solid fa-bars text-base text-gray-700"></i>
      </button>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center pl-2 gap-[10px]">

      <!-- User Dropdown -->
      <div class="relative" ref="userDropdownRef">
        <button @click="toggleUserDropdown"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white shadow hover:bg-gray-50 transition-colors">
          <div class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white">
            <i class="fa-solid fa-user text-sm"></i>
          </div>
          <div class="hidden md:block text-left">
            <div class="text-sm font-medium text-gray-900">
              {{ authStore.user?.fullName || authStore.user?.email || 'User' }}
            </div>
            <div class="text-xs text-gray-500">
              {{ authStore.roles.join(', ') || 'No Role' }}
            </div>
          </div>
          <i class="fa-solid fa-chevron-down text-xs text-gray-500 transition-transform"
            :class="{ 'rotate-180': showUserDropdown }"></i>
        </button>

        <!-- Dropdown Menu -->
        <div v-if="showUserDropdown" class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
          <div class="p-4 border-b">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white">
                <i class="fa-solid fa-user"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ authStore.user?.fullName || authStore.user?.email || 'User' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ authStore.user?.email }}
                </div>
                <div class="text-xs text-blue-600 font-medium">
                  {{ authStore.roles.join(', ') || 'No Role' }}
                </div>
              </div>
            </div>
          </div>

          <div class="py-2">
            <button @click="handleProfile"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
              <i class="fa-solid fa-user-cog w-4"></i>
              Thông tin cá nhân
            </button>
            <button @click="handleSettings"
              class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
              <i class="fa-solid fa-cog w-4"></i>
              Cài đặt
            </button>
            <hr class="my-2">
            <button @click="handleLogout"
              class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
              <i class="fa-solid fa-sign-out-alt w-4"></i>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  showPinSidebar: Boolean,
  sidebarPinned: Boolean,
})

const router = useRouter()
const authStore = useAuthStore()
const showUserDropdown = ref(false)
const userDropdownRef = ref(null)

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const handleProfile = () => {
  showUserDropdown.value = false
  // TODO: Navigate to profile page
  console.log('Navigate to profile')
}

const handleSettings = () => {
  showUserDropdown.value = false
  // TODO: Navigate to settings page
  console.log('Navigate to settings')
}

const handleLogout = async () => {
  showUserDropdown.value = false

  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    await authStore.logout()
    router.push('/login')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    showUserDropdown.value = false
  }
}

onMounted(() => {
  authStore.initializeAuth()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

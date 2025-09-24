<template>
  <div
    class="sidebar bg-[#3F4D67] text-white flex flex-col shadow-lg fixed left-0 z-50 transition-transform duration-300 ease-in-out"
    :style="{ top: '0px', height: '100vh' }" :class="{ '-translate-x-full': !isOpen }">
    <div class="flex items-center px-4 pt-4">
      <img src="@/assets/img/logo.png" alt="Ảnh" class="w-[31px] h-[38px] object-contain rounded mr-2" />
      <span class="text-lg font-extralight font-inter text-white">Trang quản trị</span>
    </div>

    <div class="mt-6 flex flex-col items-start">
      <router-link :to="{ name: 'dashboard' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-gauge"></i>
        Tổng quan
      </router-link>

      <router-link :to="{ name: 'pos' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-cash-register"></i>
        Bán hàng tại quầy
      </router-link>

      <router-link to="/billmanagement"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-file-invoice"></i>
        Quản lý đơn hàng
      </router-link>

      <router-link to="/revenue"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-chart-line"></i>
        Báo cáo doanh thu
      </router-link>



      <div class="w-full">
        <button
          class="w-[230px] h-[50px] flex items-center justify-between font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition"
          @click="openAccountMenu = !openAccountMenu">
          <span class="flex items-center gap-2">
            <i class="fa-solid fa-user"></i>
            Quản lý tài khoản
          </span>
          <i class="mr-[40px] fa-solid fa-chevron-right transition-transform duration-300"
            :class="{ 'rotate-90': openAccountMenu }"></i>
        </button>

        <transition name="slide-fade">
          <div v-if="openAccountMenu" class="flex flex-col ml-8 overflow-hidden">
            <router-link to="/staff"
              class="w-[190px] h-[40px] flex items-center gap-2 font-inter font-extralight text-sm text-left hover:bg-[#5c6e91] transition rounded">
              <i class="mx-3 fa-solid fa-user-tie"></i>
              Quản lý nhân viên
            </router-link>
            <router-link to="/account"
              class="w-[190px] h-[40px] flex items-center gap-2 font-inter font-extralight text-sm text-left hover:bg-[#5c6e91] transition rounded">
              <i class="mx-2 fa-solid fa-users"></i>
              Quản lý khách hàng
            </router-link>
          </div>
        </transition>
      </div>


      <router-link :to="{ name: 'food' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-boxes-stacked"></i>
        Quản lý đồ ăn
      </router-link>

      <router-link :to="{ name: 'combo' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-layer-group"></i>
        Quản lý combo
      </router-link>

      <router-link :to="{ name: 'category' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-list"></i>
        Loại đồ ăn
      </router-link>

      <router-link :to="{ name: 'voucher' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-boxes-stacked"></i>
        Quản lý Voucher
      </router-link>

      <router-link :to="{ name: 'promotion' }"
        class="w-[230px] h-[50px] flex items-center gap-2 font-inter font-extralight text-sm text-left pl-[21px] hover:bg-[#5c6e91] transition">
        <i class="fa-solid fa-boxes-stacked"></i>
        Quản lý khuyến mãi
      </router-link>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  navbarHeight: Number,
  isMobile: Boolean,
})

const emit = defineEmits(['close'])
const openAccountMenu = ref(false)
</script>

<style>
.sidebar {
  width: 230px;
  min-width: 230px;
  max-width: 230px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sidebar::-webkit-scrollbar {
  display: none;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 100px;
}
</style>

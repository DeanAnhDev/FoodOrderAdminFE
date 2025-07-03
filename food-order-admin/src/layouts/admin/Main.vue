<template>
  <div class="home-view bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] min-h-screen p-4">
    <div class="max-w-8xl mx-auto">
      <div class="pc-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'HomeView' })
</script>

<style scoped>
.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px 0 rgba(63, 77, 103, 0.12);
}
</style>

<template>
    <div class="shipper-layout">
        <Header />
        <main class="main-content">
            <router-view />
        </main>
    </div>
</template>

<script>
import Header from './Header.vue'

export default {
    name: 'ShipperLayout',
    components: {
        Header
    }
}
</script>

<style scoped>
.shipper-layout {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.main-content {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}
</style>
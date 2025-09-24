<template>
    <header class="shipper-header">
        <div class="header-content">
            <div class="logo">
                <img src="@/assets/img/logo.png" alt="Logo" class="logo-img" />
                <h1>Shipper Dashboard</h1>
            </div>
            <div class="header-info">
                <span class="current-time">{{ currentTime }}</span>
            </div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'ShipperHeader',
    data() {
        return {
            currentTime: '',
            timer: null
        }
    },
    mounted() {
        this.updateTime()
        this.timer = setInterval(this.updateTime, 1000)
    },
    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    },
    methods: {
        updateTime() {
            const now = new Date()
            this.currentTime = now.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }
    }
}
</script>

<style scoped>
.shipper-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 15px;
}

.logo-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.logo h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
}

.header-info {
    display: flex;
    align-items: center;
    gap: 20px;
}

.current-time {
    font-size: 1rem;
    font-weight: 500;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: 10px;
    }

    .logo h1 {
        font-size: 1.5rem;
    }
}
</style>
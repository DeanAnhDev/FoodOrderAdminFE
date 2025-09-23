<template>
    <div class="unauthorized-container">
        <div class="unauthorized-content">
            <div class="error-icon">
                <i class="fas fa-shield-alt"></i>
            </div>
            <h1>403</h1>
            <h2>Không có quyền truy cập</h2>
            <p class="error-message">
                {{ errorMessage || 'Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.' }}
            </p>

            <div class="user-info" v-if="authStore.user">
                <p><strong>Tài khoản:</strong> {{ authStore.user.email }}</p>
                <p><strong>Quyền hiện tại:</strong> {{ authStore.roles.join(', ') || 'Không có' }}</p>
            </div>

            <div class="action-buttons">
                <button @click="goBack" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại
                </button>
                <button @click="goHome" class="btn btn-primary">
                    <i class="fas fa-home"></i>
                    Trang chủ
                </button>
                <button @click="logout" class="btn btn-outline">
                    <i class="fas fa-sign-out-alt"></i>
                    Đăng xuất
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export default {
    name: 'UnauthorizedView',
    setup() {
        const route = useRoute()
        const router = useRouter()
        const authStore = useAuthStore()

        const errorMessage = computed(() => route.query.message)

        const goBack = () => {
            router.go(-1)
        }

        const goHome = () => {
            router.push('/dashboard')
        }

        const logout = async () => {
            await authStore.logout()
            router.push('/login')
        }

        onMounted(() => {
            authStore.initializeAuth()
        })

        return {
            authStore,
            errorMessage,
            goBack,
            goHome,
            logout
        }
    }
}
</script>

<style scoped>
.unauthorized-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #ff7b7b 0%, #ff9999 100%);
    padding: 20px;
}

.unauthorized-content {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    text-align: center;
    max-width: 500px;
    width: 100%;
}

.error-icon {
    font-size: 80px;
    color: #ff6b6b;
    margin-bottom: 20px;
}

h1 {
    font-size: 72px;
    font-weight: bold;
    color: #ff6b6b;
    margin: 0;
    line-height: 1;
}

h2 {
    font-size: 28px;
    color: #333;
    margin: 10px 0 20px 0;
    font-weight: 600;
}

.error-message {
    color: #666;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 30px;
}

.user-info {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
    text-align: left;
}

.user-info p {
    margin: 8px 0;
    color: #555;
}

.action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #545b62;
    transform: translateY(-2px);
}

.btn-outline {
    background-color: transparent;
    color: #ff6b6b;
    border: 2px solid #ff6b6b;
}

.btn-outline:hover {
    background-color: #ff6b6b;
    color: white;
    transform: translateY(-2px);
}

@media (max-width: 480px) {
    .unauthorized-content {
        padding: 30px 20px;
    }

    h1 {
        font-size: 60px;
    }

    h2 {
        font-size: 24px;
    }

    .action-buttons {
        flex-direction: column;
        align-items: stretch;
    }

    .btn {
        justify-content: center;
    }
}
</style>
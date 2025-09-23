<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo-section">
                    <img src="@/assets/img/logo.png" alt="Logo" class="logo" />
                    <h1>Food Order Admin</h1>
                </div>
                <p class="subtitle">Đăng nhập vào hệ thống quản trị</p>
            </div>

            <form @submit.prevent="handleLogin" class="login-form">
                <!-- Email Field -->
                <div class="form-group">
                    <label for="email" class="form-label">
                        <i class="fas fa-envelope"></i>
                        Email
                    </label>
                    <input id="email" v-model="loginForm.email" type="email" class="form-input"
                        :class="{ 'error': errors.email }" placeholder="Nhập email của bạn" required
                        autocomplete="email" />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <!-- Password Field -->
                <div class="form-group">
                    <label for="password" class="form-label">
                        <i class="fas fa-lock"></i>
                        Mật khẩu
                    </label>
                    <div class="password-input-container">
                        <input id="password" v-model="loginForm.password" :type="showPassword ? 'text' : 'password'"
                            class="form-input" :class="{ 'error': errors.password }" placeholder="Nhập mật khẩu"
                            required autocomplete="current-password" />
                        <button type="button" @click="togglePassword" class="password-toggle">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <!-- Remember Me -->
                <div class="form-group">
                    <label class="checkbox-label">
                        <input v-model="loginForm.rememberMe" type="checkbox" class="checkbox" />
                        <span class="checkmark"></span>
                        Ghi nhớ đăng nhập
                    </label>
                </div>

                <!-- Error Message -->
                <div v-if="authStore.error" class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    {{ authStore.error }}
                </div>

                <!-- Success Message -->
                <div v-if="authStore.message && !authStore.error" class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    {{ authStore.message }}
                </div>

                <!-- Login Button -->
                <button type="submit" class="login-btn" :disabled="authStore.loading || !isFormValid"
                    :class="{ 'loading': authStore.loading }">
                    <span v-if="authStore.loading" class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </span>
                    <span v-else>
                        <i class="fas fa-sign-in-alt"></i>
                    </span>
                    {{ authStore.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>

                <!-- Forgot Password -->
                <div class="forgot-password">
                    <a href="#" @click.prevent="handleForgotPassword">
                        Quên mật khẩu?
                    </a>
                </div>
            </form>

            <!-- Footer -->
            <div class="login-footer">
                <p>&copy; 2025 Food Order Admin System. All rights reserved.</p>
            </div>
        </div>

        <!-- Background Animation -->
        <div class="background-animation">
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
            <div class="floating-shape shape-3"></div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export default {
    name: 'LoginView',
    setup() {
        const router = useRouter()
        const authStore = useAuthStore()

        // Form data
        const loginForm = ref({
            email: '',
            password: '',
            rememberMe: false
        })

        const showPassword = ref(false)
        const errors = ref({})

        // Computed
        const isFormValid = computed(() => {
            return loginForm.value.email.trim() !== '' &&
                loginForm.value.password.trim() !== '' &&
                validateEmail(loginForm.value.email)
        })

        // Methods
        const validateForm = () => {
            errors.value = {}

            if (!loginForm.value.email.trim()) {
                errors.value.email = 'Email là bắt buộc'
            } else if (!validateEmail(loginForm.value.email)) {
                errors.value.email = 'Email không hợp lệ'
            }

            if (!loginForm.value.password.trim()) {
                errors.value.password = 'Mật khẩu là bắt buộc'
            } else if (loginForm.value.password.length < 6) {
                errors.value.password = 'Mật khẩu phải có ít nhất 6 ký tự'
            }

            return Object.keys(errors.value).length === 0
        }

        const validateEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(email)
        }

        const handleLogin = async () => {
            if (!validateForm()) {
                return
            }

            try {
                await authStore.login({
                    userName: loginForm.value.email.trim(),  // API expects userName
                    password: loginForm.value.password,
                    // Note: rememberMe is not in API spec, removed for now
                })

                if (!authStore.error) {
                    // Redirect dựa trên role
                    const redirectPath = getRedirectPath()
                    router.push(redirectPath)
                }
            } catch (error) {
                console.error('Login error:', error)
            }
        }

        const getRedirectPath = () => {
            // Redirect dựa trên role của user
            if (authStore.isAdmin) {
                return '/dashboard'
            } else if (authStore.isManager) {
                return '/dashboard'
            } else {
                return '/dashboard' // Default route
            }
        }

        const togglePassword = () => {
            showPassword.value = !showPassword.value
        }

        const handleForgotPassword = () => {
            // TODO: Implement forgot password
            alert('Chức năng quên mật khẩu sẽ được triển khai sau')
        }

        // Lifecycle
        onMounted(() => {
            // Kiểm tra nếu đã đăng nhập thì redirect
            authStore.initializeAuth()
            if (authStore.isAuthenticated) {
                const redirectPath = getRedirectPath()
                router.push(redirectPath)
            }
        })

        return {
            loginForm,
            showPassword,
            errors,
            authStore,
            isFormValid,
            handleLogin,
            togglePassword,
            handleForgotPassword
        }
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.login-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 40px;
    width: 100%;
    max-width: 450px;
    position: relative;
    z-index: 2;
    animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 10px;
}

.logo {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-header h1 {
    color: #333;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    color: #666;
    font-size: 16px;
    margin: 10px 0 0 0;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
    font-size: 14px;
}

.form-label i {
    color: #667eea;
    width: 16px;
}

.form-input {
    padding: 15px;
    border: 2px solid #e1e5e9;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
    background-color: #f8f9fa;
}

.form-input:focus {
    outline: none;
    border-color: #667eea;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
    border-color: #dc3545;
    background-color: #fff5f5;
}

.password-input-container {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    font-size: 16px;
    transition: color 0.3s ease;
}

.password-toggle:hover {
    color: #667eea;
}

.error-message {
    color: #dc3545;
    font-size: 13px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
}

.error-message::before {
    content: '⚠';
    font-size: 12px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    user-select: none;
}

.checkbox {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.checkbox:checked+.checkmark {
    background-color: #667eea;
    border-color: #667eea;
}

.checkbox:checked+.checkmark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.alert {
    padding: 12px 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    margin: 10px 0;
}

.alert-error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.login-btn {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 15px 20px;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.login-btn.loading {
    pointer-events: none;
}

.loading-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.forgot-password {
    text-align: center;
    margin-top: 15px;
}

.forgot-password a {
    color: #667eea;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
}

.forgot-password a:hover {
    color: #764ba2;
    text-decoration: underline;
}

.login-footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e1e5e9;
}

.login-footer p {
    color: #666;
    font-size: 12px;
    margin: 0;
}

/* Background Animation */
.background-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    overflow: hidden;
}

.floating-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
}

.shape-1 {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.shape-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
}

.shape-3 {
    width: 80px;
    height: 80px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(180deg);
    }
}

/* Responsive */
@media (max-width: 480px) {
    .login-card {
        padding: 30px 20px;
        margin: 10px;
    }

    .login-header h1 {
        font-size: 24px;
    }

    .form-input {
        padding: 12px;
        font-size: 16px;
    }

    .login-btn {
        padding: 12px 20px;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .login-container {
        background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }

    .login-card {
        background: #1a202c;
        color: #e2e8f0;
    }

    .form-input {
        background-color: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
    }

    .form-input:focus {
        background-color: #2d3748;
        border-color: #667eea;
    }
}
</style>
<template>
    <div class="debug-auth" v-if="isDev">
        <div class="debug-panel">
            <h3>🔧 Auth Debug Panel</h3>

            <div class="auth-status">
                <strong>Status:</strong>
                <span :class="authStore.isAuthenticated ? 'text-green-600' : 'text-red-600'">
                    {{ authStore.isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
                </span>
            </div>

            <div class="token-info" v-if="authStore.accessToken">
                <details>
                    <summary><strong>Token Info</strong></summary>
                    <div class="mt-2 space-y-2">
                        <div><strong>Has Token:</strong> {{ !!authStore.accessToken }}</div>
                        <div><strong>Token Preview:</strong> {{ tokenPreview }}</div>
                        <div><strong>Token Expired:</strong> {{ isExpired }}</div>
                        <div><strong>Expires At:</strong> {{ expirationDate }}</div>
                    </div>
                </details>
            </div>

            <div class="user-info" v-if="authStore.user">
                <details>
                    <summary><strong>User Info</strong></summary>
                    <pre class="mt-2">{{ JSON.stringify(authStore.user, null, 2) }}</pre>
                </details>
            </div>

            <div class="roles-info" v-if="authStore.roles.length > 0">
                <strong>Roles:</strong> {{ authStore.roles.join(', ') }}
            </div>

            <div class="permissions">
                <strong>Permissions:</strong>
                <ul class="list-disc list-inside">
                    <li>Is Admin: {{ authStore.isAdmin }}</li>
                    <li>Is Manager: {{ authStore.isManager }}</li>
                    <li>Has Admin Role: {{ authStore.hasRole('Admin') }}</li>
                    <li>Has Manager Role: {{ authStore.hasRole('Manager') }}</li>
                </ul>
            </div>

            <div class="quick-actions">
                <button @click="testLogin" class="btn btn-sm btn-primary mr-2">
                    Test Login
                </button>
                <button @click="testLogout" class="btn btn-sm btn-secondary">
                    Test Logout
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { isTokenExpired, getTokenExpiration } from '@/utils/jwt'

export default {
    name: 'AuthDebugPanel',
    setup() {
        const authStore = useAuthStore()
        const isDev = process.env.NODE_ENV === 'development'

        const tokenPreview = computed(() => {
            if (!authStore.accessToken) return 'No token'
            return authStore.accessToken.substring(0, 20) + '...'
        })

        const isExpired = computed(() => {
            if (!authStore.accessToken) return 'N/A'
            return isTokenExpired(authStore.accessToken)
        })

        const expirationDate = computed(() => {
            if (!authStore.accessToken) return 'N/A'
            const expDate = getTokenExpiration(authStore.accessToken)
            return expDate ? expDate.toLocaleString() : 'N/A'
        })

        const testLogin = async () => {
            try {
                await authStore.login({
                    userName: 'admin@foodorder.com',
                    password: 'Admin@123'
                })
                console.log('✅ Test login successful')
            } catch (error) {
                console.error('❌ Test login failed:', error)
            }
        }

        const testLogout = async () => {
            await authStore.logout()
            console.log('✅ Test logout successful')
        }

        return {
            authStore,
            isDev,
            tokenPreview,
            isExpired,
            expirationDate,
            testLogin,
            testLogout
        }
    }
}
</script>

<style scoped>
.debug-auth {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
}

.debug-panel {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    font-size: 12px;
}

.debug-panel h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;
}

.debug-panel>div {
    margin-bottom: 8px;
}

.debug-panel details summary {
    cursor: pointer;
    font-weight: 600;
    color: #374151;
}

.debug-panel pre {
    background: #f3f4f6;
    padding: 8px;
    border-radius: 4px;
    font-size: 10px;
    max-height: 150px;
    overflow-y: auto;
}

.text-green-600 {
    color: #059669;
}

.text-red-600 {
    color: #dc2626;
}

.btn {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #d1d5db;
    cursor: pointer;
    font-size: 11px;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
}

.btn-secondary {
    background: #6b7280;
    color: white;
    border-color: #6b7280;
}

.btn:hover {
    opacity: 0.9;
}

.mr-2 {
    margin-right: 8px;
}
</style>
<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h3>Thêm nhân viên mới</h3>
                <button @click="$emit('close')" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="modal-body">
                <div class="form-group">
                    <label for="fullName">Họ tên <span class="required">*</span></label>
                    <input id="fullName" v-model="formData.fullName" type="text" class="form-control"
                        :class="{ 'error': errors.fullName }" placeholder="Nhập họ tên" required />
                    <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
                </div>

                <div class="form-group">
                    <label for="email">Email <span class="required">*</span></label>
                    <input id="email" v-model="formData.email" type="email" class="form-control"
                        :class="{ 'error': errors.email }" placeholder="Nhập email" required />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                    <label for="phoneNumber">Số điện thoại <span class="required">*</span></label>
                    <input id="phoneNumber" v-model="formData.phoneNumber" type="tel" class="form-control"
                        :class="{ 'error': errors.phoneNumber }" placeholder="Nhập số điện thoại" required />
                    <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
                </div>

                <div class="form-group">
                    <label for="password">Mật khẩu <span class="required">*</span></label>
                    <div class="password-input">
                        <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                            class="form-control" :class="{ 'error': errors.password }" placeholder="Nhập mật khẩu"
                            required />
                        <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                    </div>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    <small class="form-text">Mật khẩu phải có ít nhất 6 ký tự</small>
                </div>

                <div v-if="submitError" class="error-message submit-error">
                    {{ submitError }}
                </div>

                <div class="modal-footer">
                    <button type="button" @click="$emit('close')" class="btn btn-secondary">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                        {{ loading ? 'Đang thêm...' : 'Thêm nhân viên' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/staffStore'

export default {
    name: 'AddStaffModal',
    emits: ['close', 'success'],
    setup(props, { emit }) {
        const userStore = useUserStore()

        const formData = reactive({
            fullName: '',
            email: '',
            phoneNumber: '',
            password: ''
        })

        const errors = reactive({})
        const loading = ref(false)
        const submitError = ref('')
        const showPassword = ref(false)

        const validateForm = () => {
            // Clear previous errors
            Object.keys(errors).forEach(key => delete errors[key])

            // Validate fullName
            if (!formData.fullName.trim()) {
                errors.fullName = 'Họ tên là bắt buộc'
            }

            // Validate email
            if (!formData.email.trim()) {
                errors.email = 'Email là bắt buộc'
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                errors.email = 'Email không hợp lệ'
            }

            // Validate phoneNumber
            if (!formData.phoneNumber.trim()) {
                errors.phoneNumber = 'Số điện thoại là bắt buộc'
            } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s+/g, ''))) {
                errors.phoneNumber = 'Số điện thoại phải có 10-11 chữ số'
            }

            // Validate password
            if (!formData.password) {
                errors.password = 'Mật khẩu là bắt buộc'
            } else if (formData.password.length < 6) {
                errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
            }

            return Object.keys(errors).length === 0
        }

        const handleSubmit = async () => {
            if (!validateForm()) {
                return
            }

            loading.value = true
            submitError.value = ''

            try {
                const payload = {
                    fullName: formData.fullName.trim(),
                    email: formData.email.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    password: formData.password
                }

                await userStore.addStaff(payload)
                emit('success')
            } catch (error) {
                console.error('Error adding staff:', error)

                if (error.errors) {
                    // Handle validation errors from server
                    Object.keys(error.errors).forEach(key => {
                        const fieldKey = key.toLowerCase()
                        if (error.errors[key] && error.errors[key].length > 0) {
                            errors[fieldKey] = error.errors[key][0]
                        }
                    })
                } else {
                    submitError.value = error.message || 'Có lỗi xảy ra khi thêm nhân viên'
                }
            } finally {
                loading.value = false
            }
        }

        return {
            formData,
            errors,
            loading,
            submitError,
            showPassword,
            handleSubmit
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s;
}

.close-btn:hover {
    background-color: #f8f9fa;
    color: #333;
}

.modal-body {
    padding: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.required {
    color: #dc3545;
}

.form-control {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-control.error {
    border-color: #dc3545;
}

.password-input {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.password-toggle:hover {
    color: #333;
}

.form-text {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: #6c757d;
}

.error-message {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: #dc3545;
}

.submit-error {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px;
    border-top: 1px solid #eee;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #545b62;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
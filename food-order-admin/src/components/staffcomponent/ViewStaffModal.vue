<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Chi tiết nhân viên</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="staff">
        <div class="staff-info">
          <div class="info-section">
            <h4>Thông tin cá nhân</h4>
            <div class="info-grid">
              <div class="info-row">
                <strong>ID:</strong>
                <span>{{ staff.id || 'Chưa có thông tin' }}</span>
              </div>
              <div class="info-row">
                <strong>Họ tên:</strong>
                <span>{{ staff.fullName || 'Chưa có thông tin' }}</span>
              </div>
              <div class="info-row">
                <strong>Email:</strong>
                <span>{{ staff.email || 'Chưa có thông tin' }}</span>
              </div>
              <div class="info-row">
                <strong>Số điện thoại:</strong>
                <span>{{ staff.phoneNumber || 'Chưa có thông tin' }}</span>
              </div>
              <div class="info-row">
                <strong>Tên đăng nhập:</strong>
                <span>{{ staff.userName || 'Chưa có thông tin' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ViewStaffModal',
  props: {
    staff: {
      type: Object,
      required: true
    }
  },
  emits: ['close']
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
  max-width: 700px;
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

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.info-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.info-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-row strong {
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.info-row span {
  color: #555;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 0 0 0;
  border-top: 1px solid #eee;
  margin-top: 20px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
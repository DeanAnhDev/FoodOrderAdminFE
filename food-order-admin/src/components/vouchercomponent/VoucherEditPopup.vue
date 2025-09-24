<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Sửa Voucher</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Code -->
        <div>
          <label class="block text-sm font-medium mb-1">Mã Voucher</label>
          <input v-model="form.code" type="text"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" required />
        </div>

        <!-- Giá trị giảm -->
        <div>
          <label class="block text-sm font-medium mb-1">Giá trị giảm</label>
          <input v-model.number="form.discountAmount" type="number" min="0"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" required />
        </div>

        <!-- Loại -->
        <div>
          <label class="block text-sm font-medium mb-1">Loại</label>
          <select v-model="form.type"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none">
            <option value="Percentage">Giảm theo %</option>
            <option value="Amount">Giảm theo số tiền</option>
          </select>
        </div>

        <!-- Số lượng -->
        <div>
          <label class="block text-sm font-medium mb-1">Số lượng</label>
          <input v-model.number="form.quantity" type="number" min="0"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" required />
        </div>

        <!-- Đơn tối thiểu -->
        <div>
          <label class="block text-sm font-medium mb-1">Đơn tối thiểu</label>
          <input v-model.number="form.minOrderPrice" type="number" min="0"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" />
        </div>

        <!-- Giảm tối đa -->
        <div>
          <label class="block text-sm font-medium mb-1">Giảm tối đa</label>
          <input v-model.number="form.maxDiscountPrice" type="number" min="0"
            class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:text-gray-500"
            :disabled="form.type === 'Amount'" />
        </div>

        <!-- Ngày bắt đầu & kết thúc -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input type="date" v-model="form.startDate" :min="today"
              class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" disabled />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input type="date" v-model="form.endDate" :min="form.startDate || today"
              class="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200 outline-none" required />
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="flex items-center mt-2">
          <input v-model="form.isActive" type="checkbox" class="mr-2" id="isActive" />
          <label for="isActive">Đang hoạt động</label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="close" class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
            :disabled="isSubmitting">
            Hủy
          </button>
          <button type="submit"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 transition"
            :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
            </svg>
            <span v-if="isSubmitting">Đang lưu...</span>
            <span v-else>Lưu</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"
import { useToast } from "vue-toastification"

const props = defineProps({
  visible: Boolean,
  voucher: Object,
})
const emit = defineEmits(["close", "updated"])

const voucherStore = useVoucherStore()
const toast = useToast()

const today = new Date().toISOString().split("T")[0]

const form = ref({
  voucherId: 0,
  code: "",
  discountAmount: 0,
  type: "Percent",
  quantity: 0,
  minOrderPrice: 0,
  maxDiscountPrice: 0,
  startDate: today,
  endDate: today,
  isActive: true,
})

watch(
  () => props.voucher,
  (val) => {
    if (val) {
      form.value = {
        ...val,
        startDate: val.startDate ? val.startDate.split("T")[0] : today,
        endDate: val.endDate ? val.endDate.split("T")[0] : today,
      }
    }
  },
  { immediate: true }
)

// Reset maxDiscountPrice khi chuyển sang loại "Amount"
watch(() => form.value.type, (newType) => {
  if (newType === 'Amount') {
    form.value.maxDiscountPrice = 0
  }
})

const isSubmitting = ref(false)

const close = () => emit("close")

const submitForm = async () => {
  if (!form.value.startDate || !form.value.endDate) {
    toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc")
    return
  }

  if (form.value.endDate < form.value.startDate) {
    toast.error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu")
    return
  }

  try {
    isSubmitting.value = true
    await voucherStore.updateVoucher(form.value)
    toast.success("Cập nhật voucher thành công!")
    emit("updated")
    close()
  } catch (err) {
    const backendMessage = err.response?.data?.message || 'Cập nhật thất bại!'
    toast.error(backendMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>


<style scoped>
@keyframes fade-in {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>

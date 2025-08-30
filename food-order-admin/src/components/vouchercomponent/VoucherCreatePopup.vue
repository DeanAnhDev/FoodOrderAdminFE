<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-[500px] relative shadow-2xl ring-1 ring-black/10 animate-fade-in">
      <h2 class="text-lg font-bold mb-4">Thêm Voucher</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Code -->
        <div>
          <label class="block text-sm font-medium">Mã Voucher</label>
          <input v-model="form.code" type="text" maxlength="50"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" placeholder="Nhập mã voucher"
            required />
        </div>

        <!-- Loại giảm giá -->
        <div>
          <label class="block text-sm font-medium">Loại giảm giá</label>
          <select v-model="form.type" class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none">
            <option value="Percentage">Giảm theo %</option>
            <option value="Amount">Giảm theo số tiền</option>
          </select>
        </div>

        <!-- Discount Amount -->
        <div>
          <label class="block text-sm font-medium">
            {{ form.type === 0 ? "% Giảm" : "Giảm cố định (VNĐ)" }}
          </label>
          <input v-model.number="form.discountAmount" type="number" :min="form.type === 0 ? 1 : 1000"
            :max="form.type === 0 ? 100 : null"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" required />
        </div>

        <!-- Max Discount -->
        <div>
          <label class="block text-sm font-medium">Giảm tối đa (VNĐ)</label>
          <input v-model.number="form.maxDiscountPrice" type="number" min="0"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" />
        </div>

        <!-- Ngày -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium">Ngày bắt đầu</label>
            <input v-model="form.startDate" type="date" :min="today"
              class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" required />
          </div>
          <div>
            <label class="block text-sm font-medium">Ngày kết thúc</label>
            <input v-model="form.endDate" type="date" :min="form.startDate || today"
              class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" required />
          </div>
        </div>

        <!-- Quantity -->
        <div>
          <label class="block text-sm font-medium">Số lượng</label>
          <input v-model.number="form.quantity" type="number" min="0"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" />
        </div>

        <!-- Min Order -->
        <div>
          <label class="block text-sm font-medium">Đơn hàng tối thiểu (VNĐ)</label>
          <input v-model.number="form.minOrderPrice" type="number" min="0"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-200 outline-none" />
        </div>

        <!-- Active -->
        <div class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" id="isActive" />
          <label for="isActive" class="text-sm">Kích hoạt</label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="close" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            :disabled="isSubmitting">
            Hủy
          </button>
          <button type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition"
            :disabled="isSubmitting">
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
            </svg>
            <span v-if="isSubmitting">Đang lưu...</span>
            <span v-else>Thêm</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"
import { useToast } from "vue-toastification"

const props = defineProps({ visible: Boolean })
const emit = defineEmits(["close"])

const voucherStore = useVoucherStore()
const toast = useToast()
const isSubmitting = ref(false)

const form = reactive({
  code: "",
  discountAmount: null,
  type: 0,
  quantity: 0,
  minOrderPrice: 0,
  maxDiscountPrice: 0,
  startDate: "",
  endDate: "",
  isActive: true,
})

const today = new Date().toISOString().split("T")[0]

const handleSubmit = async () => {
  if (!form.startDate || !form.endDate) {
    toast.error("Vui lòng chọn ngày bắt đầu và kết thúc")
    return
  }
  if (form.startDate < today) {
    toast.error("Ngày bắt đầu không được trong quá khứ")
    return
  }
  if (form.endDate < form.startDate) {
    toast.error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu")
    return
  }
  try {
    isSubmitting.value = true
    await voucherStore.createVoucher(form)
    toast.success("Tạo voucher thành công!")
    close()
  } catch (err) {
    const backendMessage = err.response?.data?.message || 'Tạo voucher thất bại!'
    toast.error(backendMessage)
  } finally {
    isSubmitting.value = false
  }
}

const close = () => emit("close")
</script>

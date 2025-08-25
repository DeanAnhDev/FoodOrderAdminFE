<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div class="bg-white rounded-lg shadow-lg w-[600px] p-6 relative">
      <!-- Nút đóng -->
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        ✕
      </button>

      <h2 class="text-xl font-bold mb-4">Chỉnh sửa Voucher</h2>

      <!-- Form chỉnh sửa -->
      <form @submit.prevent="updateVoucher" class="space-y-4">
        <div>
          <label class="block font-medium">Mã Voucher</label>
          <input v-model="form.code" type="text" class="w-full border p-2 rounded" required />
        </div>

        <div>
          <label class="block font-medium">Mô tả</label>
          <textarea v-model="form.description" class="w-full border p-2 rounded"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium">Giảm (%)</label>
            <input v-model.number="form.discountPercent" type="number" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block font-medium">Giảm tiền (vnđ)</label>
            <input v-model.number="form.discountAmount" type="number" class="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label class="block font-medium">Giảm tối đa</label>
          <input v-model.number="form.maxDiscountAmount" type="number" class="w-full border p-2 rounded" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium">Ngày bắt đầu</label>
            <input v-model="form.startDate" type="date" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block font-medium">Ngày kết thúc</label>
            <input v-model="form.endDate" type="date" class="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label class="block font-medium">Số lượng</label>
          <input v-model.number="form.quantity" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block font-medium">Đơn tối thiểu</label>
          <input v-model.number="form.minOrderAmount" type="number" class="w-full border p-2 rounded" />
        </div>

        <div>
          <label class="block font-medium">Trạng thái</label>
          <select v-model="form.isActive" class="w-full border p-2 rounded">
            <option :value="true">Đang hoạt động</option>
            <option :value="false">Ngưng</option>
          </select>
        </div>

        <!-- Button -->
        <div class="flex justify-end space-x-2 mt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-400 text-white rounded">
            Hủy
          </button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"

const props = defineProps({
  visible: Boolean,
  voucher: Object
})

const emit = defineEmits(["close"])

const voucherStore = useVoucherStore()

// form data
const form = reactive({
  voucherId: null,
  code: "",
  description: "",
  discountPercent: 0,
  discountAmount: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  quantity: 0,
  minOrderAmount: 0,
  isActive: true
})

// đồng bộ props.voucher -> form khi mở popup
watch(
  () => props.voucher,
  (newVal) => {
    if (newVal) {
      Object.assign(form, {
        voucherId: newVal.voucherId,
        code: newVal.code,
        description: newVal.description,
        discountPercent: newVal.discountPercent ?? 0,
        discountAmount: newVal.discountAmount ?? 0,
        maxDiscountAmount: newVal.maxDiscountAmount ?? 0,
        startDate: newVal.startDate ? newVal.startDate.split("T")[0] : "",
        endDate: newVal.endDate ? newVal.endDate.split("T")[0] : "",
        quantity: newVal.quantity ?? 0,
        minOrderAmount: newVal.minOrderAmount ?? 0,
        isActive: newVal.isActive
      })
    }
  },
  { immediate: true }
)

// cập nhật voucher
const updateVoucher = async () => {
  await voucherStore.updateVoucher(form.voucherId, { ...form })
  emit("close")
}
</script>

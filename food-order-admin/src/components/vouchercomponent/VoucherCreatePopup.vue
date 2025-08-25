<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-lg p-6 w-[500px] relative">
      <h2 class="text-xl font-semibold mb-4">Thêm Voucher</h2>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium">Mã Voucher</label>
          <input v-model="form.code" type="text" class="w-full border rounded p-2" required />
        </div>

        <div>
          <label class="block text-sm font-medium">Mô tả</label>
          <textarea v-model="form.description" class="w-full border rounded p-2"></textarea>
        </div>

        <!-- Chọn loại giảm giá -->
        <div>
          <label class="block text-sm font-medium">Loại giảm giá</label>
          <select v-model="discountType" class="w-full border rounded p-2">
            <option value="percent">Giảm theo %</option>
            <option value="amount">Giảm theo số tiền</option>
          </select>
        </div>

        <!-- Chỉ 1 input hiển thị -->
        <div>
          <label class="block text-sm font-medium">
            {{ discountType === "percent" ? "% Giảm" : "Giảm cố định (VNĐ)" }}
          </label>
          <input
            v-model.number="discountValue"
            :type="'number'"
            :min="discountType === 'percent' ? 1 : 1000"
            :max="discountType === 'percent' ? 100 : null"
            class="w-full border rounded p-2"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium">Giảm tối đa (VNĐ)</label>
          <input v-model.number="form.maxDiscountAmount" type="number" min="0" class="w-full border rounded p-2" />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-sm font-medium">Ngày bắt đầu</label>
            <input v-model="form.startDate" type="date" class="w-full border rounded p-2" required />
          </div>
          <div>
            <label class="block text-sm font-medium">Ngày kết thúc</label>
            <input v-model="form.endDate" type="date" class="w-full border rounded p-2" required />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium">Số lượng</label>
          <input v-model.number="form.quantity" type="number" min="0" class="w-full border rounded p-2" />
        </div>

        <div>
          <label class="block text-sm font-medium">Đơn hàng tối thiểu (VNĐ)</label>
          <input v-model.number="form.minOrderAmount" type="number" min="0" class="w-full border rounded p-2" />
        </div>

        <div class="flex items-center gap-2">
          <input v-model="form.isActive" type="checkbox" id="isActive" />
          <label for="isActive" class="text-sm">Kích hoạt</label>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button" @click="close" class="px-4 py-2 bg-gray-300 rounded">Hủy</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Thêm</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useVoucherStore } from "@/stores/voucherStore"

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(["close"])

const voucherStore = useVoucherStore()

// Form
const form = reactive({
  code: "",
  description: "",
  maxDiscountAmount: null,
  startDate: "",
  endDate: "",
  isActive: true,
  quantity: 0,
  minOrderAmount: 0,
})

// chọn loại giảm giá
const discountType = ref("percent")
const discountValue = ref(null)

const handleSubmit = async () => {
  const payload = { ...form }

  if (discountType.value === "percent") {
    payload.discountPercent = discountValue.value
    payload.discountAmount = null
  } else {
    payload.discountAmount = discountValue.value
    payload.discountPercent = null
  }

  await voucherStore.createVoucher(payload)
  close()
}

const close = () => {
  emit("close")
}
</script>

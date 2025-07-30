
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { uploadImage, deleteImage } from '@/services/uploadService'

export const useUploadStore = defineStore('upload', () => {
  const isUploading = ref(false)
  const uploadResult = ref(null)
  const uploadError = ref(null)

  const isDeleting = ref(false)
  const deleteError = ref(null)

  // Upload ảnh
  const upload = async (file, id) => {
    isUploading.value = true
    uploadError.value = null
    uploadResult.value = null

    try {
      const res = await uploadImage(file, id)
      uploadResult.value = res.data

      return {
        url: res.data.url,
        id: res.data.id,
        thumbnailUrl: res.data.thumbnailUrl,
        name: res.data.name,
      }
    } catch (err) {
      uploadError.value = err
      throw err
    } finally {
      isUploading.value = false
    }
  }

  // Xoá ảnh
  const remove = async (id) => {
    isDeleting.value = true
    deleteError.value = null

    try {
      const res = await deleteImage(id)
      console.log(id)
      console.log('Ảnh đã xoá:', res.data)
      return true
    } catch (err) {
      console.error('Lỗi xoá ảnh:', err)
      deleteError.value = err.response?.data?.error || 'Xoá thất bại'
      return false
    } finally {
      isDeleting.value = false
    }
  }

  return {
    // Upload
    isUploading,
    uploadResult,
    uploadError,
    upload,

    // Delete
    isDeleting,
    deleteError,
    remove
  }
})

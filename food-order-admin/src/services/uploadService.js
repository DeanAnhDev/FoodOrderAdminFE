import axiosClient from '@/axiosClient'

export const uploadImage = async (file, id) => {
  const formData = new FormData()
  formData.append('Id', id)    
  formData.append('File', file) 

  console.log('Sending FormData:', id, file)

  return await axiosClient.post('/Cloudinary/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data' 
    },
    transformRequest: [(data) => data], 
  })
}


export const deleteImage = (id) => {
  return axiosClient.delete(`/Cloudinary/${id}`)
}

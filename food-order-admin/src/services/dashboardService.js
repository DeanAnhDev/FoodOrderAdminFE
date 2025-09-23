import axiosClient from '@/axiosClient'

export const getDashboardSummary = async (params) => {
  return axiosClient.get('/dashboard/summary', { params })
}

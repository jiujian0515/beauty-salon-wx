import { http } from '@/services/request'
import type { AvailableSlot, CustomerResourcePage } from '@/types'

/** 查询某天可预约时段（公开接口，仅返回可预约时段） */
export function fetchAvailableSlots(date: string, resourceId?: number | string, merchantId?: number | string) {
  const params: Record<string, unknown> = { date }
  if (resourceId) {
    params.resourceId = resourceId
  }
  if (merchantId) {
    params.merchantId = merchantId
  }
  return http.get<AvailableSlot[]>('/api/v1/slots', params, { skipAuth: true })
}

/** 分页查询启用的美容师（公开接口） */
export function fetchCustomerResources(merchantId?: number | string, size = 50) {
  const params: Record<string, unknown> = { page: 1, size, type: 'STAFF' }
  if (merchantId) {
    params.merchantId = merchantId
  }
  return http.get<CustomerResourcePage>('/api/v1/resources', params, { skipAuth: true })
}

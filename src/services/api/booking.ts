import { http } from '@/services/request'
import type {
  AvailableSlot,
  CustomerResourcePage,
  MockPayResponse,
  ReservationCancelResponse,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationPage
} from '@/types'

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

/** 创建预约（顾客登录后调用；疗程预约免定金直接确认） */
export function createReservation(payload: ReservationCreateRequest) {
  return http.post<ReservationCreateResponse>(
    '/api/v1/reservations',
    payload as unknown as Record<string, unknown>
  )
}

/** 我的预约列表（顾客登录后调用，按预约时间倒序） */
export function fetchMyReservations(page: number, size: number, status?: string) {
  const params: Record<string, unknown> = { page, size }
  if (status) {
    params.status = status
  }
  return http.get<ReservationPage>('/api/v1/reservations/mine', params)
}

/** 取消预约（未支付直接取消；已确认按规则退款） */
export function cancelReservation(reservationId: number | string) {
  return http.post<ReservationCancelResponse>(`/api/v1/reservations/${reservationId}/cancel`)
}

/** 模拟支付定金（演示环境触发成功回调，幂等） */
export function mockPay(outTradeNo: string) {
  return http.post<MockPayResponse>('/api/v1/payments/mock-pay', { outTradeNo })
}

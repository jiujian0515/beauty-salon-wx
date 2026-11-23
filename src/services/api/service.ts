import { http } from '@/services/request'
import type { ServiceItemPage, ServiceQuery } from '@/types'

const SERVICE_BASE = '/api/v1/services'

/** 分页查询上架服务项目（公开接口，无需登录） */
export function fetchServicePage(query: ServiceQuery) {
  const params: Record<string, unknown> = { page: query.page, size: query.size }
  if (query.keyword) {
    params.keyword = query.keyword
  }
  if (query.category) {
    params.category = query.category
  }
  if (query.merchantId) {
    params.merchantId = query.merchantId
  }
  return http.get<ServiceItemPage>(SERVICE_BASE, params, { skipAuth: true })
}

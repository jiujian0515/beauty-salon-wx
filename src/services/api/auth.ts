import { http } from '@/services/request'
import type { CustomerInfo, LoginRequest, LoginResponse, WechatPhoneLoginRequest } from '@/types'

const AUTH_BASE = '/api/v1/customer/auth'

/** 手机号 + 密码登录（公开接口，无需携带 token） */
export function loginByPassword(payload: LoginRequest) {
  return http.post<LoginResponse>(`${AUTH_BASE}/login`, payload, { skipAuth: true })
}

/** 微信手机号快速登录（公开接口，无需携带 token） */
export function loginByWechatPhone(payload: WechatPhoneLoginRequest) {
  return http.post<LoginResponse>(`${AUTH_BASE}/wechat/login`, payload, { skipAuth: true })
}

/** 当前登录顾客信息（请求层自动携带 token） */
export function fetchCurrentCustomer() {
  return http.get<CustomerInfo>(`${AUTH_BASE}/me`)
}

/** 退出登录 */
export function logout() {
  return http.post<void>(`${AUTH_BASE}/logout`)
}

/**
 * 顾客端认证接口类型（对应后端 /api/v1/customer/auth/**）
 */

/** 手机号 + 密码登录入参 */
export type LoginRequest = {
  /** 手机号（后端校验 11 位大陆手机号） */
  phone: string
  /** 明文密码，由后端 BCrypt 校验 */
  password: string
}

/** 微信手机号快速登录入参 */
export type WechatPhoneLoginRequest = {
  /** wx.login() 返回的临时登录凭证，用于换取 openid */
  loginCode: string
  /** getPhoneNumber 返回的手机号授权 code，用于换取手机号 */
  phoneCode: string
}

/** 登录响应：后端只返回 token，顾客资料需再调用 /me */
export type LoginResponse = {
  token: string
}

/** GET /api/v1/customer/auth/me 返回的当前顾客信息 */
export type CustomerInfo = {
  customerId: number
  phone: string
  nickname: string
  /** 1 启用 0 禁用 */
  status: number
}

/** 预约统计（个人信息接口中的 reservationStats） */
export type ReservationStats = {
  /** 累计成功预约（COMPLETED） */
  completedCount: number
  /** 待服务（CONFIRMED） */
  pendingServiceCount: number
  /** 待支付（PENDING_PAYMENT） */
  pendingPaymentCount: number
}

/** GET /api/v1/customer/profile 返回的个人信息 + 预约统计 */
export type CustomerProfile = CustomerInfo & {
  reservationStats: ReservationStats
}

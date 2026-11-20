/** 应用内页面路径，统一在此维护，避免硬编码字符串 */
export const ROUTES = {
  HOME: '/pages/index/index',
  SERVICE_DETAIL: '/pages/service/detail/index',
  BOOKING: '/pages/booking/index',
  PAYMENT: '/pages/payment/index',
  ORDER_LIST: '/pages/order/list/index',
  ORDER_DETAIL: '/pages/order/detail/index',
  MINE: '/pages/mine/index',
  LOGIN: '/pages/login/index'
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

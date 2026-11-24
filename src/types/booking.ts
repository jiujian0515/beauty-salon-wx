/** 可售时段（对应后端 AvailableSlotResponse） */
export interface AvailableSlot {
  id: number | string
  merchantId: number | string
  resourceId: number | string
  resourceName: string
  /** STAFF 技师 / ROOM 床位 */
  resourceType: string
  /** yyyy-MM-dd */
  slotDate: string
  /** HH:mm */
  startTime: string
  /** HH:mm */
  endTime: string
  total: number
  used: number
  available: number
}

/** 顾客端资源（美容师，对应后端 CustomerResourceResponse） */
export interface CustomerResource {
  id: number | string
  merchantId: number | string
  /** STAFF / ROOM */
  type: string
  name: string
}

/** 资源分页结果（与后端 PageResult 字段一致） */
export interface CustomerResourcePage {
  records: CustomerResource[]
  total: number | string
  page: number | string
  size: number | string
  pages: number | string
}

/** 创建预约请求（对应后端 ReservationCreateRequest） */
export interface ReservationCreateRequest {
  serviceItemId: number | string
  slotId: number | string
  /** 是否疗程预约：true 免定金，创建后直接确认 */
  isCourse?: boolean
}

/** 创建预约返回体（对应后端 ReservationCreateResponse） */export interface ReservationCreateResponse {
  reservationId: number | string
  reservationNo: string
  /** PENDING_PAYMENT / CONFIRMED */
  status: string
  isCourse: boolean
  /** 定金（分）；疗程预约为 0 */
  depositCents: number | string
  /** 是否需要支付定金 */
  paymentRequired: boolean
  /** 支付订单号（仅需支付时有值） */
  orderNo?: string | null
  /** yyyy-MM-dd HH:mm:ss */
  appointmentTime?: string
  merchantId?: number | string
  resourceId?: number | string
  resourceName?: string
  slotId?: number | string
  /** 模拟支付参数（仅需支付时有值） */
  paymentParams?: Record<string, unknown> | null
}

/** 我的预约列表项（对应后端 ReservationResponse） */
export interface ReservationItem {
  reservationId: number | string
  reservationNo: string
  /** PENDING_PAYMENT / CONFIRMED / COMPLETED / CANCELLED / EXPIRED / REFUNDING / REFUNDED */
  status: string
  isCourse: boolean
  /** 定金（分）；疗程预约为 0 */
  depositCents: number | string
  /** yyyy-MM-dd HH:mm:ss */
  appointmentTime: string | null
  merchantId: number | string
  serviceItemId: number | string | null
  serviceItemName: string | null
  serviceItemDurationMinutes: number | null
  /** 服务分类 code（下架或缺省可能为空） */
  serviceItemCategory: string | null
  /** 服务价格（分） */
  serviceItemPriceCents: number | string | null
  resourceId: number | string | null
  resourceName: string | null
  /** STAFF 技师 / ROOM 床位 */
  resourceType: string | null
  /** 待支付预约的模拟支付平台交易号（继续支付用） */
  outTradeNo?: string | null
  paidAt: string | null
  cancelledAt: string | null
  createdAt: string
}

/** 我的预约分页结果 */
export interface ReservationPage {
  records: ReservationItem[]
  total: number | string
  page: number | string
  size: number | string
  pages: number | string
}

/** 模拟支付返回体（对应后端 PaymentMockPayResponse） */
export interface MockPayResponse {
  outTradeNo: string
  orderNo: string
  reservationId: number | string
  reservationNo: string
  /** CONFIRMED */
  status: string
  amountCents: number | string
  paidAt: string | null
}

/** 取消预约返回体（对应后端 ReservationCancelResponse） */
export interface ReservationCancelResponse {
  reservationId: number | string
  reservationNo: string
  /** CANCELLED / REFUNDED */
  status: string
  refunded: boolean
  refundAmountCents: number | string
  cancelledAt: string | null
}

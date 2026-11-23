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

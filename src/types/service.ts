/** 游客端服务分类 code（后端存储与接口传输均使用 code） */
export type ServiceCategory = 'SPA_BODY' | 'SPA_FACE' | 'SPA_OTHER'

/** 状态/分类的展示元信息 */
export interface StatusMeta {
  label: string
  color: string
}

/** 顾客端服务项目（后端 Long 统一序列化为字符串） */
export interface ServiceItem {
  id: number | string
  merchantId: number | string
  name: string
  /** 服务分类 code（历史数据可能为空或旧值） */
  category?: string | null
  description: string
  /** 服务时长（分钟） */
  durationMinutes: number
  /** 价格（分） */
  priceCents: number | string
  /** 定金（分） */
  depositCents: number | string
  /** 1 上架 0 下架 */
  status: number
  createdAt: string
  updatedAt: string
}

/** 服务项目分页结果（与后端 PageResult 字段一致） */
export interface ServiceItemPage {
  records: ServiceItem[]
  total: number | string
  page: number | string
  size: number | string
  pages: number | string
}

/** 顾客端服务项目查询参数 */
export interface ServiceQuery {
  page: number
  size: number
  keyword?: string
  /** 按分类 code 精确筛选 */
  category?: ServiceCategory
  merchantId?: number
}

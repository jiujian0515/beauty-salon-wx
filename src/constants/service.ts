import type { ServiceCategory, StatusMeta } from '@/types'

/** 服务分类 code：后端只存 code，界面统一展示中文名 */
export const SERVICE_CATEGORY = {
  /** 尊享身体理疗 */
  SPA_BODY: 'SPA_BODY',
  /** 尊享面部 */
  SPA_FACE: 'SPA_FACE',
  /** 尊享其他 */
  SPA_OTHER: 'SPA_OTHER'
} as const

/** 分类展示元信息（label 用于界面展示，color 供后续标签配色使用） */
export const SERVICE_CATEGORY_META: Record<ServiceCategory, StatusMeta> = {
  SPA_BODY: { label: '尊享身体理疗', color: 'cyan' },
  SPA_FACE: { label: '尊享面部', color: 'magenta' },
  SPA_OTHER: { label: '尊享其他', color: 'default' }
}

/** 分类筛选项：value 为接口传参的 code，label 为界面展示名 */
export const SERVICE_CATEGORY_OPTIONS: Array<{ value: ServiceCategory; label: string }> = [
  { value: SERVICE_CATEGORY.SPA_BODY, label: SERVICE_CATEGORY_META.SPA_BODY.label },
  { value: SERVICE_CATEGORY.SPA_FACE, label: SERVICE_CATEGORY_META.SPA_FACE.label },
  { value: SERVICE_CATEGORY.SPA_OTHER, label: SERVICE_CATEGORY_META.SPA_OTHER.label }
]

/** 判断是否为已定义的服务分类 code（历史数据可能为空或旧值） */
export function isServiceCategory(value: string | null | undefined): value is ServiceCategory {
  return (
    value === SERVICE_CATEGORY.SPA_BODY ||
    value === SERVICE_CATEGORY.SPA_FACE ||
    value === SERVICE_CATEGORY.SPA_OTHER
  )
}

/** 分类 code → 中文展示名；未知 code 返回空字符串，避免把 code 直接展示给用户 */
export function getServiceCategoryLabel(value: string | null | undefined): string {
  return isServiceCategory(value) ? SERVICE_CATEGORY_META[value].label : ''
}

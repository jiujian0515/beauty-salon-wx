/**
 * 预约页（/pages/booking/index）URL 参数统一入口
 *
 * 首页「立即预约」与订单页「再次预约」都通过 buildBookingQuery 生成参数，
 * 保证两个入口传给预约页的字段名与格式一致，避免再出现 `id` / `serviceId` 不一致。
 */
export interface BookingQuery {
  serviceId: number | string
  name: string
  category?: string | null
  durationMinutes: number
  priceCents: number | string
  depositCents: number | string
  merchantId: number | string
}

export function buildBookingQuery(params: BookingQuery): string {
  return [
    `serviceId=${params.serviceId}`,
    `name=${encodeURIComponent(params.name)}`,
    `category=${params.category ?? ''}`,
    `durationMinutes=${params.durationMinutes}`,
    `priceCents=${params.priceCents}`,
    `depositCents=${params.depositCents}`,
    `merchantId=${params.merchantId}`
  ].join('&')
}

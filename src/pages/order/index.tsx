import { useCallback, useEffect, useRef, useState } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { ROUTES } from '@/constants/routes'
import { fetchMyReservations, cancelReservation, mockPay } from '@/services/api'
import type { ReservationItem } from '@/types'
import { buildBookingQuery } from '@/utils/booking'
import { navigateTo, switchTab } from '@/utils/navigation'
import { formatPrice } from '@/utils/price'
import './index.scss'

const PAGE_SIZE = 10
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 状态 → 展示文案与色系（色系对应 scss 的 tone 修饰类） */
const STATUS_META: Record<string, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: '待支付 · 席位预占中', tone: 'pending' },
  CONFIRMED: { label: '已确认 · 待到店', tone: 'confirmed' },
  COMPLETED: { label: '已完成 · 门店已核销', tone: 'done' },
  CANCELLED: { label: '已取消', tone: 'closed' },
  EXPIRED: { label: '已失效', tone: 'closed' },
  REFUNDING: { label: '退款中', tone: 'pending' },
  REFUNDED: { label: '已退款', tone: 'closed' }
}

/** 状态筛选标签：value 为空表示「全部」 */
const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: '', label: '全部' },
  { value: 'PENDING_PAYMENT', label: '待支付' },
  { value: 'CONFIRMED', label: '已确认' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' }
]

function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status || '未知状态', tone: 'closed' }
}

/** 预约时间 → 「今天/明天/周X M月D日」+「HH:mm」 */
function formatAppointment(value: string | null): { day: string; time: string } {
  if (!value) {
    return { day: '-', time: '' }
  }
  const [datePart, timePart = ''] = value.split(' ')
  const [year, month, date] = datePart.split('-').map(Number)
  if (!year || !month || !date) {
    return { day: datePart, time: timePart.slice(0, 5) }
  }
  const target = new Date(year, month - 1, date)
  const today = new Date()
  const diff = Math.round(
    (target.getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86400000
  )
  const prefix = diff === 0 ? '今天' : diff === 1 ? '明天' : WEEKDAYS[target.getDay()]
  return { day: `${prefix} ${month}月${date}日`, time: timePart.slice(0, 5) }
}

export default function OrderListPage() {
  const [tab, setTab] = useState('')
  const [records, setRecords] = useState<ReservationItem[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const requestSeq = useRef(0)

  const load = useCallback(async (targetPage: number, status: string, append: boolean) => {
    const seq = requestSeq.current + 1
    requestSeq.current = seq
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
      const result = await fetchMyReservations(targetPage, PAGE_SIZE, status || undefined)
      if (seq !== requestSeq.current) {
        return
      }
      setRecords((prev) => (append ? [...prev, ...result.records] : result.records))
      setPage(Number(result.page) || targetPage)
      setPages(Number(result.pages) || 0)
    } catch (error) {
      if (seq === requestSeq.current) {
        Taro.showToast({
          title: error instanceof Error ? error.message : '预约加载失败，请稍后重试',
          icon: 'none'
        })
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [])

  useEffect(() => {
    load(1, '', false)
  }, [load])

  usePullDownRefresh(() => {
    load(1, tab, false).finally(() => Taro.stopPullDownRefresh())
  })

  useReachBottom(() => {
    if (loading || loadingMore || page >= pages) {
      return
    }
    load(page + 1, tab, true)
  })

  const changeTab = (next: string) => {
    if (next === tab) {
      return
    }
    setTab(next)
    setRecords([])
    load(1, next, false)
  }

  const bookAgain = (item: ReservationItem) => {
    const serviceId = item.serviceItemId
    if (!serviceId) {
      Taro.showToast({ title: '服务项目已下架', icon: 'none' })
      return
    }
    const query = buildBookingQuery({
      serviceId,
      name: item.serviceItemName ?? '',
      category: item.serviceItemCategory,
      durationMinutes: item.serviceItemDurationMinutes ?? 0,
      priceCents: item.serviceItemPriceCents ?? 0,
      depositCents: item.depositCents,
      merchantId: item.merchantId
    })
    navigateTo(`${ROUTES.BOOKING}?${query}`)
  }

  const refresh = () => load(1, tab, false)

  const payDeposit = async (item: ReservationItem) => {
    if (!item.outTradeNo) {
      Taro.showToast({ title: '支付信息缺失，请重新预约', icon: 'none' })
      return
    }
    Taro.showLoading({ title: '支付中…', mask: true })
    try {
      await mockPay(item.outTradeNo)
      Taro.hideLoading()
      Taro.showToast({ title: '支付成功，预约已确认', icon: 'none' })
      refresh()
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({
        title: error instanceof Error ? error.message : '支付失败，请稍后重试',
        icon: 'none'
      })
    }
  }

  /** 取消预约：未支付直接取消；已确认由后端按 24h 规则退款 */
  const cancelOrder = async (item: ReservationItem) => {
    const unpaid = item.status === 'PENDING_PAYMENT'
    const res = await Taro.showModal({
      title: unpaid ? '放弃预约' : '取消预约',
      content: unpaid
        ? '该预约尚未支付，放弃后将释放已占用时段。'
        : item.isCourse
          ? '取消后本次疗程次数将退回到您的账户。'
          : '距服务开始 24 小时以上可取消，已付定金将原路退回。',
      confirmText: unpaid ? '放弃' : '取消预约',
      cancelText: '再想想',
      confirmColor: '#9b5d64'
    })
    if (!res.confirm) {
      return
    }
    Taro.showLoading({ title: '处理中…', mask: true })
    try {
      const result = await cancelReservation(item.reservationId)
      Taro.hideLoading()
      Taro.showToast({
        title: result.refunded
          ? `已取消，定金 ¥${formatPrice(result.refundAmountCents)} 已退回`
          : '预约已取消',
        icon: 'none'
      })
      refresh()
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({
        title: error instanceof Error ? error.message : '取消失败，请稍后重试',
        icon: 'none'
      })
    }
  }

  const goHome = () => switchTab(ROUTES.HOME)

  return (
    <View className='order-list-page'>
      <View className='order-assure'>
        <View className='order-assure__mark'>
          <Text className='order-assure__mark-text'>✓</Text>
        </View>
        <View className='order-assure__text'>
          <Text className='order-assure__title'>官方预约保障</Text>
          <Text className='order-assure__desc'>距服务开始 24 小时以上可免费取消并原路退定</Text>
        </View>
      </View>

      <ScrollView className='order-tabs' scrollX enhanced showScrollbar={false}>
        {STATUS_TABS.map((item) => (
          <View
            className={`order-tabs__item${tab === item.value ? ' order-tabs__item--active' : ''}`}
            key={item.value || 'all'}
            onClick={() => changeTab(item.value)}
          >
            <Text className='order-tabs__label'>{item.label}</Text>
          </View>
        ))}
      </ScrollView>

      {loading && <Text className='order-hint'>正在加载预约…</Text>}

      {!loading && records.length === 0 && (
        <View className='order-empty'>
          <View className='order-empty__mark'>
            <Text className='order-empty__mark-text'>❀</Text>
          </View>
          <Text className='order-empty__title'>暂无预约单</Text>
          <Text className='order-empty__desc'>
            挑选一段专属于您的静谧时光，在芳疗与科技抚育下重焕光彩
          </Text>
          <View className='order-empty__btn' onClick={goHome}>
            <Text className='order-empty__btn-text'>浏览精选项目</Text>
          </View>
        </View>
      )}

      {records.map((item) => {
        const meta = statusMeta(item.status)
        const time = formatAppointment(item.appointmentTime)
        return (
          <View className='order-card' key={item.reservationId}>
            <View className={`order-card__head order-card__head--${meta.tone}`}>
              <View className='order-card__status'>
                <View className='order-card__dot' />
                <Text className='order-card__status-text'>{meta.label}</Text>
              </View>
              <Text className='order-card__no'>{item.reservationNo}</Text>
            </View>

            <View className='order-card__body'>
              <Text className='order-card__name'>{item.serviceItemName || '服务项目已下架'}</Text>

              <View className='order-card__tags'>
                {item.serviceItemDurationMinutes ? (
                  <Text className='order-card__tag'>{item.serviceItemDurationMinutes} 分钟</Text>
                ) : null}
                <Text
                  className={`order-card__tag${
                    item.isCourse ? ' order-card__tag--course' : ' order-card__tag--deposit'
                  }`}
                >
                  {item.isCourse ? '疗程预约 · 免定金' : '定金预约制'}
                </Text>
              </View>

              <View className='order-card__info'>
                <View className='order-card__info-row'>
                  <Text className='order-card__info-label'>预约到店</Text>
                  <Text className='order-card__info-value'>
                    {time.day}
                    {time.time ? ` ${time.time}` : ''}
                  </Text>
                </View>
                <View className='order-card__info-row'>
                  <Text className='order-card__info-label'>
                    {item.resourceType === 'ROOM' ? '专属包间' : '专属美疗师'}
                  </Text>
                  <Text className='order-card__info-value'>{item.resourceName || '智能分配'}</Text>
                </View>
              </View>

              <View className='order-card__foot'>
                {item.isCourse ? (
                  <Text className='order-card__amount order-card__amount--course'>免定金预约</Text>
                ) : (
                  <Text className='order-card__amount'>
                    {item.paidAt ? '已付定金' : '应付定金'}
                    <Text className='order-card__amount-value'>
                      ¥{formatPrice(item.depositCents)}
                    </Text>
                  </Text>
                )}
                {item.status === 'PENDING_PAYMENT' && (
                  <Text className='order-card__note'>超时未支付将自动释放席位</Text>
                )}
              </View>

              <View className='order-card__actions'>
                {item.status === 'PENDING_PAYMENT' && (
                  <>
                    <View
                      className='order-card__btn order-card__btn--ghost'
                      onClick={() => cancelOrder(item)}
                    >
                      <Text className='order-card__btn-text order-card__btn-text--muted'>
                        放弃预约
                      </Text>
                    </View>
                    <View className='order-card__btn' onClick={() => payDeposit(item)}>
                      <Text className='order-card__btn-text'>
                        继续支付 ¥{formatPrice(item.depositCents)}
                      </Text>
                    </View>
                  </>
                )}
                {item.status === 'CONFIRMED' && (
                  <View
                    className='order-card__btn order-card__btn--ghost'
                    onClick={() => cancelOrder(item)}
                  >
                    <Text className='order-card__btn-text order-card__btn-text--muted'>
                      取消预约
                    </Text>
                  </View>
                )}
                {(item.status === 'COMPLETED' ||
                  item.status === 'CANCELLED' ||
                  item.status === 'EXPIRED' ||
                  item.status === 'REFUNDED' ||
                  item.status === 'REFUNDING') && (
                  <View
                    className='order-card__btn order-card__btn--ghost'
                    onClick={() => bookAgain(item)}
                  >
                    <Text className='order-card__btn-text'>再次预约</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )
      })}

      {loadingMore && <Text className='order-hint'>正在加载更多…</Text>}
      {!loading && !loadingMore && records.length > 0 && page >= pages && (
        <Text className='order-hint order-hint--end'>— 没有更多预约了 —</Text>
      )}
    </View>
  )
}

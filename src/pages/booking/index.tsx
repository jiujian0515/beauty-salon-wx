import { useCallback, useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { ScrollView, Text, View } from '@tarojs/components'
import { ROUTES } from '@/constants/routes'
import { getServiceCategoryLabel } from '@/constants/service'
import { fetchAvailableSlots, fetchCustomerResources } from '@/services/api'
import type { AvailableSlot, CustomerResource } from '@/types'
import { formatPrice } from '@/utils/price'
import './index.scss'

const DAY_COUNT = 14
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

interface DateOption {
  value: string
  day: number
  label: string
}

function toDateValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function buildDateOptions(): DateOption[] {
  const today = new Date()
  return Array.from({ length: DAY_COUNT }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index)
    return {
      value: toDateValue(date),
      day: date.getDate(),
      label: index === 0 ? '今天' : index === 1 ? '明天' : WEEKDAYS[date.getDay()]
    }
  })
}

/** 按开始时间把时段分为上午 / 下午 / 傍晚 */
function groupSlots(slots: AvailableSlot[]) {
  const groups: Array<{ key: string; title: string; items: AvailableSlot[] }> = [
    { key: 'morning', title: '上午时段', items: [] },
    { key: 'afternoon', title: '下午时段', items: [] },
    { key: 'evening', title: '傍晚与晚间', items: [] }
  ]
  slots.forEach((slot) => {
    const hour = Number(slot.startTime.split(':')[0])
    if (hour < 12) {
      groups[0].items.push(slot)
    } else if (hour < 18) {
      groups[1].items.push(slot)
    } else {
      groups[2].items.push(slot)
    }
  })
  return groups.filter((group) => group.items.length > 0)
}

function readParams() {
  const params = Taro.getCurrentInstance().router?.params ?? {}
  return {
    serviceId: params.serviceId ?? '',
    name: params.name ? decodeURIComponent(params.name) : '',
    category: params.category ?? '',
    durationMinutes: Number(params.durationMinutes) || 0,
    priceCents: params.priceCents ?? '0',
    depositCents: params.depositCents ?? '0',
    merchantId: params.merchantId ?? ''
  }
}

export default function BookingPage() {
  const service = useMemo(readParams, [])
  const dateOptions = useMemo(buildDateOptions, [])
  const [selectedDate, setSelectedDate] = useState(dateOptions[1]?.value ?? dateOptions[0].value)
  const [staffList, setStaffList] = useState<CustomerResource[]>([])
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerResources(service.merchantId || undefined)
      .then((result) => setStaffList(result.records))
      .catch(() => setStaffList([]))
  }, [service.merchantId])

  const loadSlots = useCallback(async () => {
    setLoading(true)
    setSelectedSlot(null)
    try {
      const list = await fetchAvailableSlots(
        selectedDate,
        selectedResourceId || undefined,
        service.merchantId || undefined
      )
      setSlots(list)
    } catch (error) {
      setSlots([])
      Taro.showToast({
        title: error instanceof Error ? error.message : '时段加载失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedResourceId, service.merchantId])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const groups = useMemo(() => groupSlots(slots), [slots])

  const depositText = `¥${formatPrice(service.depositCents)}`
  const balanceText = `¥${formatPrice(Number(service.priceCents) - Number(service.depositCents))}`

  const confirm = () => {
    if (!selectedSlot) {
      Taro.showToast({ title: '请先选择预约时段', icon: 'none' })
      return
    }
    const query = [
      `serviceId=${service.serviceId}`,
      `slotId=${selectedSlot.id}`,
      `resourceId=${selectedSlot.resourceId}`,
      `date=${selectedSlot.slotDate}`,
      `startTime=${selectedSlot.startTime}`,
      `endTime=${selectedSlot.endTime}`,
      `depositCents=${service.depositCents}`,
      `priceCents=${service.priceCents}`,
      `name=${encodeURIComponent(service.name)}`
    ].join('&')
    Taro.navigateTo({ url: `${ROUTES.PAYMENT}?${query}` })
  }

  return (
    <View className='booking-page'>
      <View className='booking-tip'>根据门店设置，最早可预约当前时间 24 小时后的时段</View>

      <View className='booking-card'>
        <View className='booking-card__head'>
          <Text className='booking-card__name'>{service.name || '未选择服务'}</Text>
          <Text className='booking-card__duration'>{service.durationMinutes} MIN</Text>
        </View>
        {getServiceCategoryLabel(service.category) && (
          <Text className='booking-card__category'>{getServiceCategoryLabel(service.category)}</Text>
        )}
        <View className='booking-card__price'>
          <Text className='booking-card__deposit'>定金 {depositText}</Text>
          <Text className='booking-card__balance'>到店付尾款 {balanceText}</Text>
        </View>
      </View>

      <View className='booking-section'>
        <Text className='booking-section__title'>选择日期</Text>
        <ScrollView className='booking-dates' scrollX enhanced showScrollbar={false}>
          {dateOptions.map((item) => (
            <View
              className={`booking-dates__item${
                selectedDate === item.value ? ' booking-dates__item--active' : ''
              }`}
              key={item.value}
              onClick={() => setSelectedDate(item.value)}
            >
              <Text className='booking-dates__label'>{item.label}</Text>
              <Text className='booking-dates__day'>{item.day}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className='booking-section'>
        <Text className='booking-section__title'>美疗师指派</Text>
        <ScrollView className='booking-staff' scrollX enhanced showScrollbar={false}>
          <View
            className={`booking-staff__item${
              selectedResourceId === '' ? ' booking-staff__item--active' : ''
            }`}
            onClick={() => setSelectedResourceId('')}
          >
            <Text className='booking-staff__name'>智能随机分配</Text>
            <Text className='booking-staff__desc'>系统优选空闲技师</Text>
          </View>
          {staffList.map((staff) => (
            <View
              className={`booking-staff__item${
                selectedResourceId === String(staff.id) ? ' booking-staff__item--active' : ''
              }`}
              key={staff.id}
              onClick={() => setSelectedResourceId(String(staff.id))}
            >
              <Text className='booking-staff__name'>{staff.name}</Text>
              <Text className='booking-staff__desc'>认证美疗师</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className='booking-section'>
        <Text className='booking-section__title'>可约时段</Text>
        {loading && <Text className='booking-hint'>正在加载可约时段…</Text>}
        {!loading && slots.length === 0 && <Text className='booking-hint'>当日暂无可约时段</Text>}
        {groups.map((group) => (
          <View className='booking-group' key={group.key}>
            <Text className='booking-group__title'>{group.title}</Text>
            <View className='booking-slots'>
              {group.items.map((slot) => {
                const active = selectedSlot?.id === slot.id
                return (
                  <View
                    className={`booking-slots__item${
                      active ? ' booking-slots__item--active' : ''
                    }`}
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <Text className='booking-slots__time'>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                    <Text className='booking-slots__rest'>
                      {slot.resourceName} · 余 {slot.available} 席
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        ))}
      </View>

      {selectedSlot && (
        <View className='booking-selected'>
          <Text className='booking-selected__title'>已选定席位</Text>
          <Text className='booking-selected__text'>
            {selectedSlot.slotDate} {selectedSlot.startTime} - {selectedSlot.endTime} ·{' '}
            {selectedSlot.resourceName}
          </Text>
        </View>
      )}

      <View className='booking-bar'>
        <View className='booking-bar__price'>
          <Text className='booking-bar__label'>定金</Text>
          <Text className='booking-bar__amount'>{depositText}</Text>
        </View>
        <View className='booking-bar__cta' onClick={confirm}>
          <Text className='booking-bar__cta-text'>确认时段，去支付定金</Text>
        </View>
      </View>
    </View>
  )
}

/*
 * @Author: liukui
 * @Date: 2026-11-21 03:52:48
 * @LastEditors: liukui
 * @LastEditTime: 2026-11-24 22:56:49
 * @Description:
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ROUTES } from '@/constants/routes'
import { createReservation, mockPay } from '@/services/api'
import type { ReservationCreateResponse } from '@/types'
import { reLaunch } from '@/utils/navigation'
import { formatPrice } from '@/utils/price'
import './index.scss'

function readParams() {
  const params = Taro.getCurrentInstance().router?.params ?? {}
  return {
    serviceId: Number(params.serviceId) || 0,
    slotId: Number(params.slotId) || 0,
    name: params.name ? decodeURIComponent(params.name) : '',
    date: params.date ?? '',
    startTime: params.startTime ?? '',
    isCourse: params.isCourse === '1'
  }
}

export default function PaymentPage() {
  const params = useMemo(readParams, [])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [result, setResult] = useState<ReservationCreateResponse | null>(null)
  const [error, setError] = useState('')

  const submit = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await createReservation({
        serviceItemId: params.serviceId,
        slotId: params.slotId,
        isCourse: params.isCourse
      })
      setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建预约失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [params.serviceId, params.slotId, params.isCourse])

  useEffect(() => {
    submit()
  }, [submit])

  // 演示环境模拟支付成功（后端 mock-pay 触发回调确认预约）
  const handleMockPay = async () => {
    const outTradeNo = result?.paymentParams?.outTradeNo
    if (typeof outTradeNo !== 'string' || !outTradeNo) {
      Taro.showToast({ title: '支付信息缺失，请重新下单', icon: 'none' })
      return
    }
    setPaying(true)
    try {
      await mockPay(outTradeNo)
      setResult((prev) => (prev ? { ...prev, status: 'CONFIRMED', paymentRequired: false } : prev))
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '支付失败，请稍后重试',
        icon: 'none'
      })
    } finally {
      setPaying(false)
    }
  }

  const backHome = () => {
    reLaunch(ROUTES.HOME)
  }

  const needPay = result?.paymentRequired === true

  return (
    <View className='payment-page'>
      {loading && (
        <View className='payment-state'>
          <View className='payment-state__spinner' />
          <Text className='payment-state__title'>正在创建预约…</Text>
          <Text className='payment-state__desc'>请稍候，正在为你锁定时段</Text>
        </View>
      )}

      {!loading && error && (
        <View className='payment-state'>
          <Text className='payment-state__title'>创建失败</Text>
          <Text className='payment-state__desc'>{error}</Text>
          <View className='payment-state__btn' onClick={submit}>
            <Text className='payment-state__btn-text'>重新尝试</Text>
          </View>
        </View>
      )}

      {!loading && !error && result && needPay && (
        <View className='payment-panel'>
          <View className='payment-panel__head'>
            <Text className='payment-panel__title'>支付定金</Text>
            <Text className='payment-panel__hint'>完成定金支付后预约即刻确认，尾款到店支付</Text>
          </View>

          <View className='payment-card'>
            <View className='payment-card__head'>
              <Text className='payment-card__name'>{params.name || '预约服务'}</Text>
              <Text className='payment-card__tag'>待支付</Text>
            </View>

            <View className='payment-card__rows'>
              <View className='payment-card__row'>
                <Text className='payment-card__label'>预约时间</Text>
                <Text className='payment-card__value'>
                  {params.date} {params.startTime}
                </Text>
              </View>
              <View className='payment-card__row'>
                <Text className='payment-card__label'>美疗师</Text>
                <Text className='payment-card__value'>{result.resourceName || '智能分配'}</Text>
              </View>
              <View className='payment-card__row'>
                <Text className='payment-card__label'>预约单号</Text>
                <Text className='payment-card__value payment-card__value--code'>
                  {result.reservationNo}
                </Text>
              </View>
            </View>
          </View>

          <View className='payment-bar'>
            <View className='payment-bar__price'>
              <Text className='payment-bar__label'>应付定金</Text>
              <Text className='payment-bar__amount'>¥{formatPrice(result.depositCents)}</Text>
            </View>
            <View
              className={`payment-bar__cta${paying ? ' payment-bar__cta--disabled' : ''}`}
              onClick={handleMockPay}
            >
              <Text className='payment-bar__cta-text'>{paying ? '支付中…' : '模拟支付'}</Text>
            </View>
          </View>
        </View>
      )}

      {!loading && !error && result && !needPay && (
        <View className='payment-done'>
          <View className='payment-done__mark'>
            <Text className='payment-done__mark-icon'>✓</Text>
          </View>
          <Text className='payment-done__title'>预约成功</Text>
          <Text className='payment-done__badge'>
            {result.isCourse ? '疗程预约 · 免定金' : '已确认'}
          </Text>

          <View className='payment-done__card'>
            <View className='payment-done__row'>
              <Text className='payment-done__label'>预约单号</Text>
              <Text className='payment-done__value payment-done__value--code'>
                {result.reservationNo}
              </Text>
            </View>
            <View className='payment-done__row'>
              <Text className='payment-done__label'>服务项目</Text>
              <Text className='payment-done__value'>{params.name || '-'}</Text>
            </View>
            <View className='payment-done__row'>
              <Text className='payment-done__label'>美疗师</Text>
              <Text className='payment-done__value'>{result.resourceName || '智能分配'}</Text>
            </View>
            <View className='payment-done__row'>
              <Text className='payment-done__label'>预约时间</Text>
              <Text className='payment-done__value'>
                {params.date} {params.startTime}
              </Text>
            </View>
          </View>

          <Text className='payment-done__tip'>请提前 10 分钟到店，如需调整请联系门店</Text>

          <View className='payment-done__btn' onClick={backHome}>
            <Text className='payment-done__btn-text'>完成</Text>
          </View>
        </View>
      )}
    </View>
  )
}

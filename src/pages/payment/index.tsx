import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function PaymentPage() {
  return (
    <View className='payment-page'>
      <PagePlaceholder title='支付定金' description='展示待支付预约单与定金金额，发起模拟支付并等待回调确认。' />
    </View>
  )
}
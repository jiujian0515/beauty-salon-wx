import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function BookingPage() {
  return (
    <View className='booking-page'>
      <PagePlaceholder title='预约时段' description='按日期查看可售时段与余量，选择后提交预约单并锁定库存。' />
    </View>
  )
}
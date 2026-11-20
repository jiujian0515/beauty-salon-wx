import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function OrderDetailPage() {
  return (
    <View className='order-detail-page'>
      <PagePlaceholder title='预约详情' description='查看预约单状态、服务信息与定金流水，支持取消预约。' />
    </View>
  )
}
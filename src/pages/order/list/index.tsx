import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function OrderListPage() {
  return (
    <View className='order-list-page'>
      <PagePlaceholder title='我的预约' description='按状态查看预约单列表，支持取消与查看详情。' />
    </View>
  )
}
import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function ServiceDetailPage() {
  return (
    <View className='service-detail-page'>
      <PagePlaceholder title='服务详情' description='查看服务说明、时长、价格与定金规则，并进入预约流程。' />
    </View>
  )
}
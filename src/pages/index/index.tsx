import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function HomePage() {
  return (
    <View className='home-page'>
      <PagePlaceholder title='服务' description='展示可预约的服务项目，含默认时长、价格与定金；点击进入详情。' />
    </View>
  )
}
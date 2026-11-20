import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function MinePage() {
  return (
    <View className='mine-page'>
      <PagePlaceholder title='个人中心' description='查看账号信息与订单入口，提供退出登录。' />
    </View>
  )
}
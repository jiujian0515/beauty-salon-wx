import { View } from '@tarojs/components'
import PagePlaceholder from '@/components/PagePlaceholder'
import './index.scss'

export default function LoginPage() {
  return (
    <View className='login-page'>
      <PagePlaceholder title='手机号登录' description='使用手机号完成登录，登录态由 Sa-Token 后端签发。' />
    </View>
  )
}
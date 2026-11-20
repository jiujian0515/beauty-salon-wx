import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // 冷启动时从本地存储恢复登录态，供请求层与页面读取
    useAuthStore.getState().hydrate()
  })

  // children 是将要渲染的页面
  return children
}

export default App

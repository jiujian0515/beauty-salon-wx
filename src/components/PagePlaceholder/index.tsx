import { Text, View } from '@tarojs/components'
import './index.scss'

interface PagePlaceholderProps {
  title: string
  description?: string
}

/** 页面占位骨架，仅用于搭建工程时占位，业务页面接入后应替换为真实内容 */
export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <View className='page-placeholder'>
      <Text className='page-placeholder__title'>{title}</Text>
      <Text className='page-placeholder__desc'>
        {description ?? '页面骨架已就绪，等待接入业务实现。'}
      </Text>
    </View>
  )
}

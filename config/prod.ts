import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {
    // 生产环境由 Nginx 托管静态资源并反向代理 /api，故保持相对路径
    publicPath: '/'
  }
} satisfies UserConfigExport<'webpack5'>

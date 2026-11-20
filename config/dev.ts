import type { UserConfigExport } from '@tarojs/cli'

// 开发环境：H5 通过 devServer 代理转发 /api，避免跨域；小程序端需在开发者工具中关闭域名校验
export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
      port: 10086,
      proxy: {
        '/api': {
          target: process.env.TARO_APP_API_TARGET || 'http://127.0.0.1:8080',
          changeOrigin: true
        }
      }
    }
  }
} satisfies UserConfigExport<'webpack5'>

/**
 * 全局常量
 * 约定：构建期注入的环境变量统一从 process.env.TARO_APP_* 读取
 */

/** 接口基础地址；留空表示与页面同源（开发环境走 devServer 代理） */
export const API_BASE_URL = process.env.TARO_APP_API_BASE_URL ?? ''

/** 后端统一响应中代表成功的 code */
export const API_SUCCESS_CODES: readonly number[] = [0, 200]

/** 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT = 15000

/** 本地存储 key，统一加前缀避免与宿主环境冲突 */
export const STORAGE_KEYS = {
  TOKEN: 'bs:token',
  USER: 'bs:user'
} as const

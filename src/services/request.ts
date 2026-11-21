import Taro from '@tarojs/taro'
import { API_BASE_URL, API_SUCCESS_CODES, REQUEST_TIMEOUT } from '@/constants'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth'
import type { ApiResponse } from '@/types/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestOptions {
  /** 相对路径（自动拼接 API_BASE_URL）或完整 URL */
  url: string
  method?: HttpMethod
  /** GET 时作为 query 参数，其余方法作为请求体 */
  data?: Record<string, unknown> | string
  header?: Record<string, string>
  timeout?: number
  /** 为 true 时不携带 Authorization */
  skipAuth?: boolean
}

/** 业务/网络错误，统一携带后端 code */
export class ApiError extends Error {
  readonly code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function resolveUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return typeof value === 'object' && value !== null && 'code' in value && 'data' in value
}

function handleUnauthorized() {
  useAuthStore.getState().clearSession()
  Taro.reLaunch({ url: ROUTES.LOGIN })
}

export async function request<T = unknown>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header, timeout = REQUEST_TIMEOUT, skipAuth = false } = options

  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header
  }
  if (!skipAuth && token) {
    headers.Authorization = `${token}`
  }

  let statusCode = 0
  let body: unknown

  try {
    const res = await Taro.request({
      url: resolveUrl(url),
      method,
      data,
      timeout,
      header: headers
    })
    statusCode = res.statusCode
    body = res.data
  } catch (error) {
    console.log('🚀 ~ request ~ error:', error)
    throw new ApiError(-1, '网络异常，请稍后重试')
  }

  if (statusCode === 401) {
    handleUnauthorized()
    throw new ApiError(401, '登录已过期，请重新登录')
  }

  if (statusCode < 200 || statusCode >= 300) {
    throw new ApiError(statusCode, `请求失败（${statusCode}）`)
  }

  if (isApiResponse(body)) {
    if (!API_SUCCESS_CODES.includes(body.code)) {
      throw new ApiError(body.code, body.message || '请求失败')
    }
    return body.data as T
  }

  return body as T
}

export const http = {
  get<T = unknown>(url: string, data?: RequestOptions['data'], options?: Partial<RequestOptions>) {
    return request<T>({ ...options, url, method: 'GET', data })
  },
  post<T = unknown>(url: string, data?: RequestOptions['data'], options?: Partial<RequestOptions>) {
    return request<T>({ ...options, url, method: 'POST', data })
  },
  put<T = unknown>(url: string, data?: RequestOptions['data'], options?: Partial<RequestOptions>) {
    return request<T>({ ...options, url, method: 'PUT', data })
  },
  patch<T = unknown>(
    url: string,
    data?: RequestOptions['data'],
    options?: Partial<RequestOptions>
  ) {
    return request<T>({ ...options, url, method: 'PATCH', data })
  },
  delete<T = unknown>(
    url: string,
    data?: RequestOptions['data'],
    options?: Partial<RequestOptions>
  ) {
    return request<T>({ ...options, url, method: 'DELETE', data })
  }
}

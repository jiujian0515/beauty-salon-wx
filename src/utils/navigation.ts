import Taro from '@tarojs/taro'

/**
 * 页面跳转统一封装
 *
 * 小程序在「上一次跳转未完成」或「同一时刻多次跳转」时会报
 * `navigateTo / reLaunch:fail timeout`，且失败 Promise 会变成未捕获异常。
 * 这里做三件事：
 * 1. 串行锁：进行中的跳转未结束前忽略后续跳转（含重复点击、并发 401 重定向）；
 * 2. 页面切换动画期间失败时自动重试一次；
 * 3. 吞掉兜底失败并打印告警，避免抛到全局。
 */

let navigating = false

/** 页面切换动画约 300~400ms，失败后等待这段时间再重试 */
const RETRY_DELAY = 400
const MAX_RETRY = 1
/** 重试仍失败后延迟解锁，避免连续打满 */
const UNLOCK_DELAY = 200

/** 归一化为以 / 开头、不含 query 的路径 */
function normalizePath(path: string): string {
  const value = path.split('?')[0]
  if (!value) {
    return ''
  }
  return value.startsWith('/') ? value : `/${value}`
}

function currentPath(): string {
  const path = Taro.getCurrentInstance()?.router?.path ?? ''
  return normalizePath(path)
}

function release() {
  setTimeout(() => {
    navigating = false
  }, UNLOCK_DELAY)
}

function attempt(url: string, action: (url: string) => Promise<unknown>, retry: number) {
  action(url).then(release, (error) => {
    // 部分场景跳转实际已成功但回调报超时，此时不再重试
    if (normalizePath(url) === currentPath()) {
      release()
      return
    }
    if (retry < MAX_RETRY) {
      setTimeout(() => attempt(url, action, retry + 1), RETRY_DELAY)
      return
    }
    console.warn('[navigation] 页面跳转失败:', url, error)
    release()
  })
}

function dispatch(url: string, action: (url: string) => Promise<unknown>) {
  if (navigating || !url) {
    return
  }
  // 已经在该页面时直接忽略，避免登录页自身触发重复 reLaunch
  if (normalizePath(url) === currentPath()) {
    return
  }

  navigating = true
  setTimeout(() => attempt(url, action, 0), 0)
}

export function navigateTo(url: string) {
  dispatch(url, (target) => Taro.navigateTo({ url: target }))
}

export function redirectTo(url: string) {
  dispatch(url, (target) => Taro.redirectTo({ url: target }))
}

export function reLaunch(url: string) {
  dispatch(url, (target) => Taro.reLaunch({ url: target }))
}

export function switchTab(url: string) {
  dispatch(url, (target) => Taro.switchTab({ url: target }))
}

export function navigateBack() {
  if (navigating || Taro.getCurrentPages().length <= 1) {
    return
  }
  navigating = true
  setTimeout(() => {
    Taro.navigateBack().then(release, (error) => {
      console.warn('[navigation] 返回上一页失败:', error)
      release()
    })
  }, 0)
}

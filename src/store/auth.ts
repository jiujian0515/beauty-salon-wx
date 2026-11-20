import Taro from '@tarojs/taro'
import { create } from 'zustand'
import { STORAGE_KEYS } from '@/constants'

export interface AuthUser {
  id: number
  nickname: string
  phone: string
}

interface AuthState {
  token: string
  user: AuthUser | null
  /** 登录成功后写入内存与本地存储 */
  setSession: (token: string, user: AuthUser) => void
  /** 退出登录或登录态失效时清理 */
  clearSession: () => void
  /** 冷启动时从本地存储恢复 */
  hydrate: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: '',
  user: null,
  setSession(token, user) {
    Taro.setStorageSync(STORAGE_KEYS.TOKEN, token)
    Taro.setStorageSync(STORAGE_KEYS.USER, user)
    set({ token, user })
  },
  clearSession() {
    Taro.removeStorageSync(STORAGE_KEYS.TOKEN)
    Taro.removeStorageSync(STORAGE_KEYS.USER)
    set({ token: '', user: null })
  },
  hydrate() {
    set({
      token: Taro.getStorageSync<string>(STORAGE_KEYS.TOKEN) || '',
      user: Taro.getStorageSync<AuthUser>(STORAGE_KEYS.USER) || null
    })
  }
}))

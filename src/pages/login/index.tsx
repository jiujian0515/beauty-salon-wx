import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Input, Text, View } from '@tarojs/components'
import type { BaseEventOrig, ButtonProps } from '@tarojs/components'
import { ROUTES } from '@/constants/routes'
import { fetchCurrentCustomer, loginByPassword, loginByWechatPhone } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import './index.scss'

type LoginMode = 'password' | 'wechat'

const PHONE_PATTERN = /^1[3-9]\d{9}$/
const IS_WEAPP = process.env.TARO_ENV === 'weapp'

function toast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

/** 登录成功后优先返回来源页；没有来源页（直接 reLaunch 到登录页）则回首页 */
function leaveLoginPage() {
  Taro.showToast({ title: '登录成功', icon: 'success', duration: 600 })
  setTimeout(() => {
    if (Taro.getCurrentPages().length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: ROUTES.HOME })
    }
  }, 600)
}

/**
 * 持久化登录态并拉取顾客资料
 *
 * 后端登录接口只返回 token，顾客信息统一通过 /me 获取；
 * 请求层从 store 读取 token，所以先写入 token 再请求 /me。
 */
async function persistSession(token: string, fallbackPhone = '') {
  const store = useAuthStore.getState()
  store.setSession(token, { id: 0, nickname: '美容用户', phone: fallbackPhone })

  try {
    const customer = await fetchCurrentCustomer()
    store.setSession(token, {
      id: customer.customerId,
      nickname: customer.nickname || '美容用户',
      phone: customer.phone || fallbackPhone
    })
  } catch (error) {
    if (!useAuthStore.getState().token) {
      // token 已被请求层判定失效并清理（401），按登录失败处理
      throw error
    }
    // 其他异常（如网络抖动）不阻断登录，先以占位资料保存登录态
    console.warn('[login] 获取顾客资料失败', error)
  }
}

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('password')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordLogin = async () => {
    if (submitting) {
      return
    }

    const account = phone.trim()
    if (!PHONE_PATTERN.test(account)) {
      toast('请输入正确的手机号')
      return
    }
    if (!password) {
      toast('请输入密码')
      return
    }

    setSubmitting(true)
    try {
      const { token } = await loginByPassword({ phone: account, password })
      await persistSession(token, account)
      leaveLoginPage()
    } catch (error) {
      toast(error instanceof Error ? error.message : '登录失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWechatLogin = async (
    event: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>
  ) => {
    if (submitting) {
      return
    }

    const { errMsg, code } = event.detail
    if (!code) {
      toast(errMsg?.includes('deny') ? '已取消手机号授权' : '未获取到手机号，请重试')
      return
    }

    setSubmitting(true)
    try {
      const { code: loginCode } = await Taro.login()
      if (!loginCode) {
        throw new Error('微信登录失败，请重试')
      }
      const { token } = await loginByWechatPhone({ loginCode, phoneCode: code })
      await persistSession(token)
      leaveLoginPage()
    } catch (error) {
      toast(error instanceof Error ? error.message : '登录失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-hero'>
        <View className='login-hero__logo'>美</View>
        <Text className='login-hero__title'>欢迎回来</Text>
        <Text className='login-hero__subtitle'>登录后预约服务、查看订单</Text>
      </View>

      <View className='login-tabs'>
        <View
          className={`login-tabs__item${mode === 'password' ? ' login-tabs__item--active' : ''}`}
          onClick={() => setMode('password')}
        >
          手机号登录
        </View>
        <View
          className={`login-tabs__item${mode === 'wechat' ? ' login-tabs__item--active' : ''}`}
          onClick={() => setMode('wechat')}
        >
          手机号快捷登录
        </View>
      </View>

      {mode === 'password' ? (
        <View className='login-card'>
          <View className='login-field'>
            <Text className='login-field__label'>手机号</Text>
            <Input
              className='login-field__input'
              type='number'
              maxlength={11}
              value={phone}
              placeholder='请输入 11 位手机号'
              placeholderClass='login-field__placeholder'
              onInput={(event) => setPhone(event.detail.value)}
            />
          </View>

          <View className='login-field'>
            <Text className='login-field__label'>密码</Text>
            <Input
              className='login-field__input'
              password
              maxlength={32}
              value={password}
              placeholder='请输入登录密码'
              placeholderClass='login-field__placeholder'
              onInput={(event) => setPassword(event.detail.value)}
            />
          </View>

          <Button
            className={`login-btn${submitting ? ' is-disabled' : ''}`}
            loading={submitting}
            disabled={submitting}
            onClick={handlePasswordLogin}
          >
            登录
          </Button>

          <Text className='login-tip'>
            还没有密码？切换到「手机号快捷登录」，未注册的手机号会自动创建账号。
          </Text>
        </View>
      ) : (
        <View className='login-card'>
          <Text className='login-wechat__desc'>
            使用微信绑定的手机号一键登录，无需输入密码；未注册的手机号将自动创建账号。
          </Text>

          {IS_WEAPP ? (
            <Button
              className={`login-btn login-btn--wechat${submitting ? ' is-disabled' : ''}`}
              openType='getPhoneNumber'
              loading={submitting}
              disabled={submitting}
              onGetPhoneNumber={handleWechatLogin}
            >
              微信手机号一键登录
            </Button>
          ) : (
            <Text className='login-wechat__hint'>该功能仅支持微信小程序，请在微信中打开使用。</Text>
          )}
        </View>
      )}
    </View>
  )
}

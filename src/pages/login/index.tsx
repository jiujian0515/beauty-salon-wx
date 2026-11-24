import { useState } from 'react'
import Taro from '@tarojs/taro'
import { Button, Image, Input, Text, View } from '@tarojs/components'
import type { BaseEventOrig, ButtonProps } from '@tarojs/components'
import logo from '@/assets/logo.png'
import { ROUTES } from '@/constants/routes'
import { fetchCurrentCustomer, loginByPassword, loginByWechatPhone } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { navigateBack, switchTab } from '@/utils/navigation'
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
      navigateBack()
    } else {
      switchTab(ROUTES.HOME)
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
  const [phone, setPhone] = useState('15116342027')
  const [password, setPassword] = useState('123456')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [agreed, setAgreed] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const notReady = () => toast('该功能暂未开放，请联系门店')

  const ensureAgreed = () => {
    if (!agreed) {
      toast('请先阅读并同意用户服务协议与隐私政策')
      return false
    }
    return true
  }

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
    if (!ensureAgreed()) {
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
    console.log('🚀 ~ handleWechatLogin ~ event:', event)
    if (submitting) {
      return
    }

    const { errMsg, code } = event.detail
    if (!code) {
      toast(errMsg?.includes('deny') ? '已取消手机号授权' : '未获取到手机号，请重试')
      return
    }
    if (!ensureAgreed()) {
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
      <View className='login-brand'>
        <View className='login-brand__mark-wrap'>
          <Image className='login-brand__mark' src={logo} mode='aspectFill' />
          <View className='login-brand__badge'>
            <View className='login-brand__dot' />
            <Text className='login-brand__badge-text'>SALON</Text>
          </View>
        </View>
        <Text className='login-brand__title'>雅奢美学沙龙</Text>
        <Text className='login-brand__subtitle'>单人私享预约 · 专属美学顾问</Text>
        <View className='login-brand__pill'>
          <Text className='login-brand__pill-text'>ATELIER MORANDI · 匠心质感护理</Text>
        </View>
      </View>

      {/* <View className='login-tabs'>
        <View
          className={`login-tabs__item${mode === 'wechat' ? ' login-tabs__item--active' : ''}`}
          onClick={() => setMode('wechat')}
        >
          <View className='login-tabs__mark'>微</View>
          <Text className='login-tabs__text'>微信快捷登录</Text>
          <Text className='login-tabs__badge'>推荐</Text>
        </View>
        <View
          className={`login-tabs__item${mode === 'password' ? ' login-tabs__item--active' : ''}`}
          onClick={() => setMode('password')}
        >
          <Text className='login-tabs__text'>账号密码登录</Text>
        </View>
      </View> */}

      {mode === 'password' ? (
        <View className='login-card'>
          <View className='login-field'>
            <Text className='login-field__label'>手机号码 / MOBILE PHONE</Text>
            <View className='login-field__control'>
              <View className='login-areacode' onClick={notReady}>
                <Text className='login-areacode__text'>+86</Text>
                <Text className='login-areacode__arrow'>⌄</Text>
              </View>
              <View className='login-areacode__divider' />
              <Input
                className='login-field__input'
                type='number'
                maxlength={11}
                value={phone}
                placeholder='请输入 11 位手机号码'
                placeholderClass='login-field__placeholder'
                onInput={(event) => setPhone(event.detail.value)}
              />
            </View>
          </View>

          <View className='login-field'>
            <Text className='login-field__label'>登录密码 / PASSWORD</Text>
            <View className='login-field__control'>
              <Input
                className='login-field__input'
                password={!passwordVisible}
                maxlength={32}
                value={password}
                placeholder='请输入登录密码'
                placeholderClass='login-field__placeholder'
                onInput={(event) => setPassword(event.detail.value)}
              />
              <Text
                className='login-field__toggle'
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? '隐藏' : '显示'}
              </Text>
            </View>
          </View>

          <View className='login-links'>
            <Text className='login-links__muted' onClick={notReady}>
              忘记密码
            </Text>
            <Text className='login-links__primary' onClick={notReady}>
              注册新账号
            </Text>
          </View>

          <Button
            className={`login-submit${submitting ? ' is-disabled' : ''}`}
            loading={submitting}
            disabled={submitting}
            onClick={handlePasswordLogin}
          >
            <Text className='login-submit__text'>立即登录</Text>
            {!submitting && <Text className='login-submit__arrow'>→</Text>}
          </Button>
        </View>
      ) : (
        <View className='login-card login-card--center'>
          <View className='login-wechat__icon'>
            <Text className='login-wechat__glyph'>微</Text>
          </View>
          <Text className='login-wechat__title'>微信官方一键授权</Text>
          <Text className='login-wechat__desc'>快速绑定当前微信号，尊享会员特权与即刻预约</Text>

          {IS_WEAPP ? (
            <Button
              className={`login-submit login-submit--wechat${submitting ? ' is-disabled' : ''}`}
              openType='getPhoneNumber'
              loading={submitting}
              disabled={submitting}
              onGetPhoneNumber={handleWechatLogin}
            >
              <Text className='login-submit__text'>授权微信快速登录</Text>
            </Button>
          ) : (
            <Button
              className='login-submit login-submit--wechat'
              onClick={() => toast('请在微信小程序中打开使用')}
            >
              <Text className='login-submit__text'>授权微信快速登录</Text>
            </Button>
          )}

          {!IS_WEAPP && (
            <Text className='login-wechat__hint'>该功能仅支持微信小程序，请在微信中打开使用</Text>
          )}
        </View>
      )}

      <View className='login-agree'>
        <View
          className={`login-agree__box${agreed ? ' login-agree__box--checked' : ''}`}
          onClick={() => setAgreed((value) => !value)}
        >
          <Text className='login-agree__check'>✓</Text>
        </View>
        <Text className='login-agree__text'>
          我已阅读并完全同意
          <Text
            className='login-agree__link'
            onClick={(event) => {
              event.stopPropagation()
              notReady()
            }}
          >
            《用户服务协议》
          </Text>
          与
          <Text
            className='login-agree__link'
            onClick={(event) => {
              event.stopPropagation()
              notReady()
            }}
          >
            《隐私权保护政策》
          </Text>
          ，登录即享雅奢会员特权与预约安全保障。
        </Text>
      </View>
    </View>
  )
}

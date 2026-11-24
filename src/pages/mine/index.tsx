import { useCallback, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Image, Text, View } from '@tarojs/components'
import contactIcon from '@/assets/contact.png'
import loginoutIcon from '@/assets/loginout.png'
import passwordIcon from '@/assets/password.png'
import reservationIcon from '@/assets/reservation.png'
import { ROUTES } from '@/constants/routes'
import { fetchCustomerProfile, logout } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { switchTab } from '@/utils/navigation'
import './index.scss'

const SUPPORT_PHONE = '02162889920'
const SUPPORT_PHONE_TEXT = '021-6288-9920'
const POLICY = [
  { title: '提前 24 小时全额可退', desc: '在服务开始前 24 小时取消预约，已付定金将原路全额退回。' },
  {
    title: '24 小时内改约保护',
    desc: '临近 24 小时内取消或失约，因专属工位已锁定，定金将转作预留补偿。'
  },
  { title: '疗程预约免定金', desc: '疗程预约不收取定金，取消后次数自动退回您的账户。' }
]

/** 手机号脱敏：13812345678 → 138****5678 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) {
    return phone || '-'
  }
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export default function MinePage() {
  const user = useAuthStore((state) => state.user)
  const [totalCount, setTotalCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [unpaidCount, setUnpaidCount] = useState(0)
  const [modal, setModal] = useState<'policy' | 'contact' | ''>('')

  const loadProfile = useCallback(async () => {
    const store = useAuthStore.getState()
    if (!store.token) {
      return
    }
    try {
      const profile = await fetchCustomerProfile()
      store.setSession(store.token, {
        id: profile.customerId,
        nickname: profile.nickname || '美容用户',
        phone: profile.phone
      })
      const stats = profile.reservationStats
      setTotalCount(stats?.completedCount ?? 0)
      setPendingCount(stats?.pendingServiceCount ?? 0)
      setUnpaidCount(stats?.pendingPaymentCount ?? 0)
    } catch {
      // 40101 已由请求层统一跳登录，其余错误不打断个人中心展示
    }
  }, [])

  useDidShow(() => {
    loadProfile()
  })

  const goOrders = () => switchTab(ROUTES.ORDER_LIST)

  const openPolicy = () => setModal('policy')

  const openContact = () => setModal('contact')

  const callSalon = () => {
    Taro.makePhoneCall({ phoneNumber: SUPPORT_PHONE }).catch(() => {
      Taro.setClipboardData({ data: SUPPORT_PHONE_TEXT })
    })
  }

  const changePassword = () => {
    Taro.showModal({
      title: '修改密码',
      content: `为避免账号风险，请联系沙龙管家（${SUPPORT_PHONE_TEXT}）协助重置登录密码。`,
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#9b5d64'
    })
  }

  const signOut = async () => {
    const res = await Taro.showModal({
      title: '退出登录',
      content: '退出后需重新登录才能查看预约与下单，确定退出吗？',
      confirmText: '退出',
      cancelText: '再想想',
      confirmColor: '#9b5d64'
    })
    if (!res.confirm) {
      return
    }
    try {
      await logout()
    } catch {
      // 服务端会话失效也应清理本地登录态
    }
    useAuthStore.getState().clearSession()
    Taro.reLaunch({ url: ROUTES.LOGIN })
  }

  const nickname = user?.nickname || '美容用户'
  const phoneText = maskPhone(user?.phone ?? '')

  return (
    <View className='mine-page'>
      <View className='mine-head'>
        <View className='mine-head__dot' />
        <Text className='mine-head__title'>Profile</Text>
      </View>

      <View className='mine-card'>
        <View className='mine-card__profile'>
          <View className='mine-card__avatar'>
            <Text className='mine-card__avatar-text'>{nickname.slice(0, 1)}</Text>
          </View>
          <View className='mine-card__info'>
            <View className='mine-card__name-row'>
              <Text className='mine-card__name'>{nickname}</Text>
              <Text className='mine-card__badge'>尊享会员</Text>
            </View>
            <Text className='mine-card__phone'>{phoneText}</Text>
            <View className='mine-card__bind'>
              <View className='mine-card__bind-dot' />
              <Text className='mine-card__bind-text'>微信安全快捷登录已绑定</Text>
            </View>
          </View>
        </View>

        <View className='mine-card__stats'>
          <View className='mine-card__stat' onClick={goOrders}>
            <Text className='mine-card__stat-label'>累计预约</Text>
            <View className='mine-card__stat-value'>
              <Text className='mine-card__stat-num'>{totalCount}</Text>
              <Text className='mine-card__stat-unit'>次</Text>
            </View>
          </View>
          <View className='mine-card__stat mine-card__stat--active' onClick={goOrders}>
            <Text className='mine-card__stat-label'>待服务</Text>
            <View className='mine-card__stat-value'>
              <Text className='mine-card__stat-num mine-card__stat-num--accent'>
                {pendingCount}
              </Text>
              <Text className='mine-card__stat-unit mine-card__stat-unit--accent'>笔</Text>
            </View>
          </View>
          <View className='mine-card__stat' onClick={goOrders}>
            <Text className='mine-card__stat-label'>待支付</Text>
            <View className='mine-card__stat-value'>
              <Text
                className={`mine-card__stat-num${
                  unpaidCount > 0 ? ' mine-card__stat-num--accent' : ''
                }`}
              >
                {unpaidCount}
              </Text>
              <Text className='mine-card__stat-unit'>笔</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='mine-assure'>
        <View className='mine-assure__mark'>
          <Text className='mine-assure__mark-text'>✓</Text>
        </View>
        <View className='mine-assure__text'>
          <Text className='mine-assure__title'>沙龙订金保障计划</Text>
          <Text className='mine-assure__desc'>体验前 24 小时可无忧全额退还订金</Text>
        </View>
      </View>

      <View className='mine-group'>
        <Text className='mine-group__label'>账户安全与服务设置</Text>

        <View className='mine-item' onClick={changePassword}>
          <View className='mine-item__icon'>
            <Image className='mine-item__icon-img' src={passwordIcon} mode='aspectFit' />
          </View>
          <View className='mine-item__text'>
            <Text className='mine-item__title'>修改密码</Text>
            <Text className='mine-item__desc'>定期更新保护顾客账户与预约信息安全</Text>
          </View>
          <Text className='mine-item__arrow'>›</Text>
        </View>

        <View className='mine-item' onClick={openPolicy}>
          <View className='mine-item__icon'>
            <Image className='mine-item__icon-img' src={reservationIcon} mode='aspectFit' />
          </View>
          <View className='mine-item__text'>
            <Text className='mine-item__title'>预约规则与取消条款</Text>
            <Text className='mine-item__desc'>提前 24 小时随时改约，专属工位安心锁定</Text>
          </View>
          <Text className='mine-item__arrow'>›</Text>
        </View>

        <View className='mine-item' onClick={openContact}>
          <View className='mine-item__icon'>
            <Image className='mine-item__icon-img' src={contactIcon} mode='aspectFit' />
          </View>
          <View className='mine-item__text'>
            <Text className='mine-item__title'>联系沙龙管家</Text>
            <Text className='mine-item__desc'>每日 10:00 - 21:30 专属美学顾问在线</Text>
          </View>
          <Text className='mine-item__arrow'>›</Text>
        </View>
      </View>

      <View className='mine-group'>
        <View className='mine-item' onClick={signOut}>
          <View className='mine-item__icon mine-item__icon--danger'>
            <Image className='mine-item__icon-img' src={loginoutIcon} mode='aspectFit' />
          </View>
          <View className='mine-item__text'>
            <Text className='mine-item__title mine-item__title--danger'>退出当前登录</Text>
            <Text className='mine-item__desc'>解绑当前会话并返回账户登录页</Text>
          </View>
          <Text className='mine-item__arrow'>›</Text>
        </View>
      </View>

      {modal !== '' && (
        <View className='mine-modal' onClick={() => setModal('')}>
          <View className='mine-modal__panel' onClick={(event) => event.stopPropagation()}>
            <View className='mine-modal__head'>
              <Text className='mine-modal__title'>
                {modal === 'policy' ? '预约退改与定金须知' : '联系沙龙客服'}
              </Text>
              <Text className='mine-modal__close' onClick={() => setModal('')}>
                ×
              </Text>
            </View>

            {modal === 'policy' ? (
              POLICY.map((item) => (
                <View className='mine-modal__row' key={item.title}>
                  <Text className='mine-modal__row-title'>{item.title}</Text>
                  <Text className='mine-modal__row-desc'>{item.desc}</Text>
                </View>
              ))
            ) : (
              <>
                <View className='mine-modal__row'>
                  <Text className='mine-modal__row-title'>尊享热线 {SUPPORT_PHONE_TEXT}</Text>
                  <Text className='mine-modal__row-desc'>周一至周日 10:00 - 21:30</Text>
                </View>
                <View className='mine-modal__row'>
                  <Text className='mine-modal__row-title'>门店地址</Text>
                  <Text className='mine-modal__row-desc'>
                    上海市静安区莫兰迪艺术美学街区 88 号 2F
                  </Text>
                </View>
                <View className='mine-modal__cta' onClick={callSalon}>
                  <Text className='mine-modal__cta-text'>拨打客服电话</Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

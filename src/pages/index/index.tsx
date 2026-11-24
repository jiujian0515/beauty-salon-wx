import { useCallback, useEffect, useRef, useState } from 'react'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { Image, Input, Text, View } from '@tarojs/components'
import logo from '@/assets/logo.png'
import { ROUTES } from '@/constants/routes'
import { SERVICE_CATEGORY_OPTIONS, getServiceCategoryLabel } from '@/constants/service'
import { fetchServicePage } from '@/services/api'
import type { ServiceCategory, ServiceItem } from '@/types'
import { navigateTo } from '@/utils/navigation'
import { formatPrice } from '@/utils/price'
import './index.scss'

const PAGE_SIZE = 10
const STORE_FEATURES = ['一客一换消毒', '五星技师', '私密单间']
/** 服务分类筛选项；value 为空表示「全部」 */
const CATEGORY_FILTERS: Array<{ value: ServiceCategory | ''; label: string }> = [
  { value: '', label: '全部' },
  ...SERVICE_CATEGORY_OPTIONS
]

function toYuan(cents: number | string): string {
  return formatPrice(cents)
}

export default function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [inputValue, setInputValue] = useState('')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<ServiceCategory | ''>('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const requestSeq = useRef(0)

  const loadServices = useCallback(
    async (
      targetPage: number,
      searchKeyword: string,
      searchCategory: ServiceCategory | '',
      append: boolean
    ) => {
      const seq = requestSeq.current + 1
      requestSeq.current = seq
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      try {
        const result = await fetchServicePage({
          page: targetPage,
          size: PAGE_SIZE,
          keyword: searchKeyword,
          category: searchCategory || undefined
        })
        if (seq !== requestSeq.current) {
          return
        }
        setServices((prev) => (append ? [...prev, ...result.records] : result.records))
        setPage(Number(result.page) || targetPage)
        setPages(Number(result.pages) || 0)
      } catch (error) {
        if (seq === requestSeq.current) {
          Taro.showToast({
            title: error instanceof Error ? error.message : '服务加载失败，请稍后重试',
            icon: 'none'
          })
        }
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    loadServices(1, '', '', false)
  }, [loadServices])

  useReachBottom(() => {
    if (loading || loadingMore || page >= pages) {
      return
    }
    loadServices(page + 1, keyword, category, true)
  })

  usePullDownRefresh(() => {
    loadServices(1, keyword, category, false).finally(() => Taro.stopPullDownRefresh())
  })

  const applySearch = (value: string) => {
    const nextKeyword = value.trim()
    setInputValue(value)
    setKeyword(nextKeyword)
    setServices([])
    loadServices(1, nextKeyword, category, false)
  }

  const handleClear = () => {
    setInputValue('')
    if (keyword) {
      setKeyword('')
      setServices([])
      loadServices(1, '', category, false)
    }
  }

  const selectCategory = (nextCategory: ServiceCategory | '') => {
    if (nextCategory === category) {
      return
    }
    setCategory(nextCategory)
    setServices([])
    loadServices(1, keyword, nextCategory, false)
  }

  const openDetail = (service: ServiceItem) => {
    navigateTo(`${ROUTES.SERVICE_DETAIL}?id=${service.id}`)
  }

  const startBooking = (service: ServiceItem) => {
    const query = [
      `serviceId=${service.id}`,
      `name=${encodeURIComponent(service.name)}`,
      `category=${service.category ?? ''}`,
      `durationMinutes=${service.durationMinutes}`,
      `priceCents=${service.priceCents}`,
      `depositCents=${service.depositCents}`,
      `merchantId=${service.merchantId}`
    ].join('&')
    navigateTo(`${ROUTES.BOOKING}?${query}`)
  }

  return (
    <View className='home-page'>
      <View className='home-brand'>
        <Image className='home-brand__logo' src={logo} mode='aspectFill' />
        <View className='home-brand__text'>
          <Text className='home-brand__name'>雅奢沙龙 · 科技美肤美甲</Text>
          <Text className='home-brand__subtitle'>Atelier Morandi · Services</Text>
        </View>
      </View>

      <View className='home-hero'>
        <View className='home-hero__top'>
          <View className='home-hero__intro'>
            <Text className='home-hero__eyebrow'>Haute Beauté &amp; Wellness</Text>
            <Text className='home-hero__title'>雅奢沙龙美学馆</Text>
            <Text className='home-hero__address'>环球中心总店 · 尊享高定空间</Text>
          </View>
          <View className='home-hero__status'>
            <View className='home-hero__status-pill'>
              <View className='home-hero__status-dot' />
              <Text className='home-hero__status-text'>营业中</Text>
            </View>
            <Text className='home-hero__hours'>10:00 - 21:00</Text>
          </View>
        </View>
        <View className='home-hero__features'>
          {STORE_FEATURES.map((feature) => (
            <Text className='home-hero__feature' key={feature}>
              {feature}
            </Text>
          ))}
        </View>
      </View>

      <View className='home-search'>
        <View className='home-search__icon' />
        <Input
          className='home-search__input'
          value={inputValue}
          placeholder='搜索服务名称'
          placeholderClass='home-search__placeholder'
          confirmType='search'
          onInput={(event) => setInputValue(event.detail.value)}
          onConfirm={(event) => applySearch(event.detail.value)}
        />
        {inputValue && (
          <Text className='home-search__clear' onClick={handleClear}>
            ×
          </Text>
        )}
      </View>

      <View className='home-categories'>
        {CATEGORY_FILTERS.map((item) => (
          <View
            className={`home-categories__pill${
              category === item.value ? ' home-categories__pill--active' : ''
            }`}
            key={item.value || 'all'}
            onClick={() => selectCategory(item.value)}
          >
            <Text className='home-categories__text'>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='home-list'>
        {services.map((service) => {
          const categoryLabel = getServiceCategoryLabel(service.category)
          return (
            <View className='service-card' key={service.id} onClick={() => openDetail(service)}>
              <View className='service-card__head'>
                <Text className='service-card__name'>{service.name}</Text>
                <View className='service-card__tags'>
                  {categoryLabel && <Text className='service-card__category'>{categoryLabel}</Text>}
                  <Text className='service-card__duration'>{service.durationMinutes} MIN</Text>
                </View>
              </View>

              {service.description && (
                <View className='service-card__desc'>
                  <Text className='service-card__desc-mark'>✓</Text>
                  <Text className='service-card__desc-text'>{service.description}</Text>
                </View>
              )}

              <View className='service-card__foot'>
                <View className='service-card__price-block'>
                  <Text className='service-card__price'>¥{toYuan(service.priceCents)}</Text>
                  <Text className='service-card__deposit'>
                    定金 ¥{toYuan(service.depositCents)} 锁定时段
                  </Text>
                </View>
                <View
                  className='service-card__cta'
                  onClick={(event) => {
                    event.stopPropagation()
                    startBooking(service)
                  }}
                >
                  <Text className='service-card__cta-text'>立即预约</Text>
                  <Text className='service-card__cta-arrow'>→</Text>
                </View>
              </View>
            </View>
          )
        })}

        {loading && <Text className='home-list__hint'>正在为您准备服务项目…</Text>}
        {!loading && services.length === 0 && (
          <Text className='home-list__hint'>
            {keyword
              ? '未找到相关服务，换个关键词试试'
              : category
                ? '该分类暂无服务'
                : '暂无服务项目'}
          </Text>
        )}
        {!loading && services.length > 0 && page >= pages && (
          <Text className='home-list__hint home-list__hint--end'>— 已展示全部服务 —</Text>
        )}
        {loadingMore && <Text className='home-list__hint'>加载更多…</Text>}
      </View>

      <View className='home-guarantee'>
        <Text className='home-guarantee__icon'>✓</Text>
        <Text className='home-guarantee__text'>
          平台保障 · 提前24小时可全额退定金 · 预留私密房间
        </Text>
      </View>
    </View>
  )
}

/*
 * @Author: liukui
 * @Date: 2026-11-21 03:51:22
 * @LastEditors: liukui
 * @LastEditTime: 2026-11-23 16:25:06
 * @Description:
 */
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/service/detail/index',
    'pages/booking/index',
    'pages/payment/index',
    'pages/order/list/index',
    'pages/order/detail/index',
    'pages/mine/index',
    'pages/login/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '美容预约',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f7f7f8'
  },
  tabBar: {
    color: '#8a8a8f',
    selectedColor: '#9B5D64',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '服务',
        iconPath: 'assets/tabbar/service.png',
        selectedIconPath: 'assets/tabbar/service-active.png'
      },
      {
        pagePath: 'pages/order/list/index',
        text: '预约',
        iconPath: 'assets/tabbar/appointment.png',
        selectedIconPath: 'assets/tabbar/appointment-active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine-active.png'
      }
    ]
  }
})

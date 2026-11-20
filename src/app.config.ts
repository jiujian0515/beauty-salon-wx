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
    selectedColor: '#e0658a',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '服务'
      },
      {
        pagePath: 'pages/order/list/index',
        text: '我的预约'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})

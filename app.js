//app.js

App({
  //小程序初始化完成时触发，调用API从本地缓存中获取数据
  onLaunch: function () {},
  //获取用户的信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    typelist: [{
        typeid: 111,
        title: '购物',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 222,
        title: '餐饮',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 333,
        title: '交通',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 444,
        title: '住宿',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 555,
        title: '玩乐',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 666,
        title: '其他',
        selected: false,
        isTouchMove: false
      }
    ]
  }
})
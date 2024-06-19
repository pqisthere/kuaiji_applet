//app.js

App({
  //小程序初始化完成时触发，调用API从本地缓存中获取数据
  onLaunch: function () {
    // 清除本地缓存的用户信息
    wx.removeStorageSync('userInfo');
    // 初始化云开发环境
    wx.cloud.init({
      env: 'kuaijizhang-6gcgnrb110c61495', // 你的环境ID
      traceUser: true,
    });
  },
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
    userInfo: null,
    loggedInUserName: null,
    rawlist: [], // 保存全局数据的数组，用于存储账本数据
    typelist: [{
        typeid: 111,
        typetitle: '购物',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 222,
        typetitle: '餐饮',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 333,
        typetitle: '交通',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 444,
        typetitle: '住宿',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 555,
        typetitle: '玩乐',
        selected: false,
        isTouchMove: false
      },
      {
        typeid: 666,
        typetitle: '其他',
        selected: false,
        isTouchMove: false
      }
    ]
  }
})
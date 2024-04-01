var app = getApp(); // 获取全局应用实例

// 从本地存储中获取账单数据，如果不存在则设置为空数组
var rawlist = wx.getStorageSync('cashflow') || [];

Page({
  data: {
    mainindex: '', // 主索引
    typelist: app.globalData.typelist,
    title: '', // 页面标题
    sum: 0, // 账单总花费
    sublist: [] // 账单子项列表
  },

  onLoad: function (params) {
    // 初始化页面数据
    this.setData({
      mainindex: params.index, // 设置主索引为参数中的索引值
      title: rawlist[params.index].title, // 设置页面标题为对应索引下账单的标题
    });
    wx.setNavigationBarTitle({ // 设置页面导航栏标题
      title: this.data.title
    });
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    rawlist = wx.getStorageSync('cashflow') || []; // 从本地存储中获取账单数据，如果不存在则设置为空数组
    var sublist = rawlist[this.data.mainindex].items; // 获取主索引对应的账单子项列表
    var sum = 0; // 初始化该账目总花费为0
    for (var i = 0; i < sublist.length; i++) { // 遍历账目子项列表
      sum += parseFloat(sublist[i].cost); // 计算总花费
    }
    this.setData({ // 更新页面数据
      sum: sum.toFixed(1), // 总花费并保留一位小数
      sublist: sublist, // 账目子项列表
      typelist: app.globalData.typelist // 消费类型
    });
    console.log('我是handbook/index的onshow，我的sublist有：', this.data.sublist)
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '小账本', // 分享标题
      desc: '快来康康!!', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  },

  // 手指开始触摸屏幕时触发，记录触摸的起始位置的 X 坐标
  touchstart: function (e) {
    this.setData({ // 更新页面数据
      startX: e.changedTouches[0].clientX, // 记录起始X坐标
      sublist: this.data.sublist // 设置账目子项列表
    });
  },

  // 滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index, // 当前索引
      startX = that.data.startX, // 滑动的起点位置
      touchMoveX = e.changedTouches[0].clientX; // 滑动过程中的实时位置

    // 遍历账目子项列表
    that.data.sublist.forEach(function (v, i) {
      if (i == index) { // 当前遍历到的列表项是被滑动的那一项
        if (touchMoveX > startX) // 右滑不生效，不显示删除按钮，适用于左滑后再右滑恢复原状
          v.isTouchMove = false
        else // 左滑生效，显示删除按钮
          v.isTouchMove = true
      }
    });
    // 更新页面数据
    that.setData({
      sublist: that.data.sublist // 设置账单子项列表
    });
  },

  // 删除事件处理
  del: function (e) {
    var index = e.currentTarget.dataset.index; // 获取要删除的索引
    rawlist[this.data.mainindex].items.splice(index, 1); // 从原始数据中删除对应索引的数据
    this.setData({ // 更新页面数据
      sublist: this.data.sublist
    });
    wx.setStorageSync('cashflow', rawlist); // 更新本地存储中的数据
    wx.showToast({ // 弹出删除成功提示
      title: '删除成功',
      icon: 'success',
      duration: 500
    });

    var audioCtx = wx.createInnerAudioContext(); // 创建音频对象
    // 播放音效
    audioCtx.src = '/pages/common/audio/删除.mp3'; // 设置音频资源的地址
    audioCtx.play(); // 播放音频
    this.onShow(); // 重新加载页面数据
  }

});
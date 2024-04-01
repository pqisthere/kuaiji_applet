// 首页index.js

// 获取应用实例
var app = getApp()
// 创建音频对象
var audioCtx = wx.createInnerAudioContext();

Page({
  data: { // 页面初始数据
    modalHidden1: true, // 默认隐藏新增账目模态框
    modalHidden2: true, // 默认隐藏设置模态框
    temptitle: '', // 临时标题
    tempindex: '', // 临时索引
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    var list = wx.getStorageSync('cashflow') || []; // 从本地缓存中获取用户现金流数据，如果没有则为空数组
    // 遍历列表项，为每个列表项添加isTouchMove属性，并初始化为false
    list.forEach(function (item) {
      item.isTouchMove = false;
    });
    this.setData({
      list: list
    });
    console.log('我是pages/index的onshow，我的list有：', this.data.list)
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '小账本', // 分享标题
      desc: '快来康康!!', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  },

  // 新增账目模态框-显示
  showModal1: function () {
    this.setData({
      modalHidden1: !this.data.modalHidden1, // 模态框的显示状态取反
    })
  },

  // 设置账目名（新增、重命名）：用户输入标题时更新页面上标题
  setTitle: function (e) {
    this.setData({
      temptitle: e.detail.value // 将用户输入的内容保存到temptitle
    })
  },

  // 新增账目模态框-确认
  modalBindaconfirm1: function () {
    var templist = this.data.list // 复制原列表数据
    var newTitle = this.data.temptitle // 获取新账目标题
    templist.push({ // 将新项添加到列表末尾
      title: newTitle,
      id: templist.length,
      items: []
    })
    // 更新数据，关闭模态框，并清空输入框
    this.setData({
      modalHidden1: !this.data.modalHidden1,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: templist
    })
    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', templist)
    // 播放音效
    audioCtx.src = '/pages/common/audio/提交.mp3'; // 设置音频资源的地址
    audioCtx.play(); // 播放音频
  },

  // 新增账目模态框-取消
  modalBindcancel1: function () {
    this.setData({
      modalHidden1: !this.data.modalHidden1, // 关闭模态框
    })
  },

  // 重命名模态框-显示
  showModal2: function (e) {
    var index = e.currentTarget.dataset.index // 获取当前项索引
    var temptitle = this.data.list[index].title // 获取当前项标题
    this.setData({
      modalHidden2: !this.data.modalHidden2, // 显示模态框
      temptitle: temptitle, // 帐目名
      tempindex: index // 账目索引
    })
  },

  // 重命名模态框-确认
  modalBindaconfirm2: function () {
    var templist = this.data.list // 获取当前列表数据
    var index = this.data.tempindex // 获取需要重命名的项的索引
    templist[index].title = this.data.temptitle // 修改当前项标题

    // 将按钮的位置重置为初始位置，此行要写在setData前面
    templist[index].isTouchMove = false;

    // 更新数据，关闭模态框，并清空输入框
    this.setData({
      modalHidden2: !this.data.modalHidden2,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: templist
    })

    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', templist)
  },

  // 重命名模态框-取消
  modalBindcancel2: function () {
    var templist = this.data.list // 获取当前列表数据
    var index = this.data.tempindex // 获取需要重命名的项的索引
    // 将按钮的位置重置为初始位置，此行要写在setData前面
    templist[index].isTouchMove = false;
    this.setData({
      modalHidden2: !this.data.modalHidden2,
      list: templist
    })
  },

  // 手指开始触摸屏幕时触发，记录触摸的起始位置的 X 坐标
  touchstart: function (e) {
    this.setData({ // 更新页面数据
      startX: e.changedTouches[0].clientX, // 记录起始X坐标
      list: this.data.list // 设置账目列表
    })
  },

  // 滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index, // 当前索引
      startX = that.data.startX, // 滑动的起点位置
      touchMoveX = e.changedTouches[0].clientX; // 滑动过程中的实时位置

    // 遍历账目
    that.data.list.forEach(function (v, i) {
      if (i == index) { // 当前遍历到的列表项是被滑动的那一项
        if (touchMoveX > startX)
          // 右滑不生效，不显示按钮，也可适用于左滑后再右滑恢复原状
          v.isTouchMove = false
        else // 左滑生效，显示按钮
          v.isTouchMove = true
      }
    })
    // 更新数据
    that.setData({
      list: that.data.list
    })
  },

  // 删除事件
  del: function (e) {
    var index = e.currentTarget.dataset.index // 获取要删除的列表项的索引
    var templist = this.data.list // 获取当前列表数据
    templist.splice(index, 1) // 删除当前 临时数据 中的列表数组
    this.setData({ // 更新实际页面数据
      list: templist
    })
    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', templist)
    wx.showToast({ // 提示框
      title: '删除成功',
      icon: 'success',
      duration: 500
    });

    // 播放音效
    audioCtx.src = '/pages/common/audio/删除.mp3'; // 设置音频资源的地址
    audioCtx.play(); // 播放音频
  }
})
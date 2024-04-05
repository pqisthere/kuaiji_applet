// 首页index.js

// 获取应用实例
var app = getApp()
// 从本地存储中获取账单数据，如果不存在则设置为空数组
var rawlist = wx.getStorageSync('cashflow') || [];
// 创建音频对象
var audioCtx = wx.createInnerAudioContext();

Page({
  data: { // 页面初始数据
    modalHidden1: true, // 默认隐藏新增账目模态框
    modalHidden2: true, // 默认隐藏设置模态框
    modalHidden3: true, // 默认隐藏昵称模态框
    temptitle: '', // 临时标题
    tempindex: '', // 临时索引
    list: [], // 账本列表
    avatarUrl: 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/imag/kuromi.jpg', //https://env-00jxgn6qwwy9.normal.cloudstatic.cn/imag/avatar.png是院徽 默认头像url
    nickname: "可点击修改", // 用户昵称
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    // 将每项的 isTouchMove 设为false
    rawlist.forEach(function (item) {
      item.isTouchMove = false;
    });
    this.setData({
      list: rawlist
    });
    console.log('账本：', this.data.list)
  },

  // 点击头像，修改头像事件处理函数
  modifyAvatar: function () {
    var that = this;
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，这里设置为1
      sizeType: ['original', 'compressed'], // 指定是原图还是压缩图，默认都有
      sourceType: ['album', 'camera'], // 指定来源是相册还是相机，默认都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths; // 获取选择的图片临时文件路径
        that.setData({
          avatarUrl: tempFilePaths[0] // 每次选择图片并更新头像时，之前选择的图片临时文件会被新的图片临时文件替换
        });
      }
    });
  },

  // 昵称模态框-显示
  modifyNickname: function () {
    this.setData({
      modalHidden3: !this.data.modalHidden3, // 模态框的显示状态取反
    })
  },

  // 修改昵称
  setName: function (e) {
    this.setData({
      tempNickname: e.detail.value // 将用户输入的内容保存到tempNickname
    })
  },

  // 昵称模态框-确认
  modalBindconfirm3: function () {
    var newNickname = this.data.tempNickname // 获取新昵称
    // 关闭模态框，更新昵称
    this.setData({
      modalHidden3: !this.data.modalHidden3,
      nickname: newNickname
    })
    this.onShow(); // 重新加载页面数据
    // 播放提交音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E6%8F%90%E4%BA%A4.mp3';
    audioCtx.play();
  },

  // 昵称模态框-取消
  modalBindcancel3: function () {
    this.setData({
      modalHidden3: !this.data.modalHidden3, // 关闭模态框
    })
  },

  // 新增账本模态框-显示
  showModal1: function () {
    this.setData({
      modalHidden1: !this.data.modalHidden1, // 模态框的显示状态取反
    })
  },

  // 新增/修改账本名
  setTitle: function (e) {
    this.setData({
      temptitle: e.detail.value // 将用户输入的内容保存到temptitle
    })
  },

  // 新增账本模态框-确认
  modalBindconfirm1: function () {
    var newTitle = this.data.temptitle // 获取新账本标题
    // 检查是否存在同名的账本
    var isDuplicate = rawlist.some(item => item.title === newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '账本名不能重复!',
        icon: 'none',
      });
      return;
    }
    rawlist.push({ // 无重名则将新账本添加到本地存储列表末尾
      title: newTitle,
      id: rawlist.length,
      items: [] // items存储账本中的消费记录，默认为空
    })

    // 关闭模态框，清空输入框，更新本地列表
    this.setData({
      modalHidden1: !this.data.modalHidden1,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: rawlist
    })

    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', rawlist)
    console.log('新增账本成功√')
    this.onShow(); // 重新加载页面数据
    // 播放提交音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E6%8F%90%E4%BA%A4.mp3';
    audioCtx.play();
  },

  // 新增账本模态框-取消
  modalBindcancel1: function () {
    this.setData({
      modalHidden1: !this.data.modalHidden1, // 关闭模态框
    })
  },

  // 重命名模态框-显示
  showModal2: function (e) {
    var tempindex = e.currentTarget.dataset.index // 获取当前项索引
    var temptitle = this.data.list[tempindex].title // 获取当前项标题
    this.setData({
      modalHidden2: !this.data.modalHidden2, // 显示模态框
      temptitle: temptitle, // 帐本名
      tempindex: tempindex // 账本索引
    })
  },

  // 重命名模态框-确认
  modalBindconfirm2: function () {
    var index = this.data.tempindex // 获取需要重命名的项的索引
    var newTitle = this.data.temptitle // 获取新账本标题
    // 检查是否存在同名的账本
    var isDuplicate = rawlist.some(item => item.title === newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '账本名不能重复或无更改!',
        icon: 'none',
      });
      return;
    }
    rawlist[index].title = this.data.temptitle // 修改该项本地存储的标题

    // 初始化按钮位置，此行要写在setData前面
    rawlist[index].isTouchMove = false;

    // 关闭模态框，清空输入框，更新数据
    this.setData({
      modalHidden2: !this.data.modalHidden2,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: rawlist
    })

    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', rawlist)
    console.log('重命名账本名成功√')
    this.onShow(); // 重新加载页面数据
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
      list: this.data.list // 账单
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
          // 右滑不生效，不显示按钮，也适用于左滑后再右滑恢复原状
          v.isTouchMove = false
        else // 左滑生效，显示按钮
          v.isTouchMove = true
      }
    })
    that.setData({ // 更新数据
      list: that.data.list // 账本
    })
  },

  // 删除事件
  del: function (e) {
    var index = e.currentTarget.dataset.index // 获取要删除的列表项的索引
    rawlist.splice(index, 1); // 从原始数据中删除对应索引的数据
    this.setData({ // 更新数据
      list: rawlist
    })
    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', rawlist)
    wx.showToast({ // 提示框
      title: '删除成功',
      icon: 'success',
      duration: 500
    });
    console.log('删除账本成功')
    this.onShow(); // 重新加载页面数据

    // 播放删除音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E5%88%A0%E9%99%A4.mp3';
    audioCtx.play();
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '超方便的小账本❤', // 分享标题
      desc: '快来康康!!', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  },

})
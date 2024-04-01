// 设置页settings.js

// 获取应用实例
var app = getApp()

Page({
  // 页面初始数据
  data: {
    modalHidden: true, // 隐藏新增类型模态框
    modalHidden2: true, // 隐藏重命名类型模态框
    temptitle: '', // 临时标题
    list: app.globalData.typelist // 初始化消费类型list为空数组
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    // 在页面显示时重新将全局数据赋值给data中的list
    var typelist = app.globalData.typelist;
    typelist.forEach(function (item) {
      item.isTouchMove = false; // 将每个元素的isTouchMove属性设置为false
    });
    // 更新页面数据，将处理后的typelist赋值给list
    this.setData({
      list: typelist
    });
    console.log('设置页面onShow', this.data.list);
  },
  
  // 新增/修改消费类型标题
  setTitle: function (e) {
    this.setData({
      temptitle: e.detail.value // 将用户输入的内容保存到 temptitle
    });
  },

  // 新增类型模态框-显示
  showModal: function (e) {
    this.setData({
      modalHidden: !this.data.modalHidden
    });
  },

  // 新增类型模态框-确认
  modalBindaconfirm: function (e) {
    var newTitle = this.data.temptitle; // 获取新账目标题
    app.globalData.typelist.push({ // 将新项添加到全局列表中
      title: newTitle,
      selected: false,
      isTouchMove: false
    });
    this.setData({ // 关闭模态框，清空输入框，更新消费类型
      modalHidden: true,
      temptitle: '', // 清空输入框中的内容
      list: app.globalData.typelist
    });
    console.log('新增后全局的消费类型数据', app.globalData.typelist);
  },

  // 新增类型模态框-取消
  modalBindcancel: function () {
    this.setData({
      modalHidden: !this.data.modalHidden, // 关闭模态框
    })
  },

  // 手指开始触摸屏幕时触发，记录触摸的起始位置的 X 坐标
  // 若此函数删除，则无法右滑恢复原状，因为没有记录初始 X 坐标
  touchstart: function (e) {
    this.setData({ // 更新页面数据
      startX: e.changedTouches[0].clientX,
      list: this.data.list
    })
  },

  // 滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index, // 当前索引
      startX = that.data.startX, // 滑动的起点位置
      touchMoveX = e.changedTouches[0].clientX; // 滑动过程中的实时位置

    that.data.list.forEach(function (v, i) { // v当前遍历数组元素，i索引
      v.isTouchMove = false
      if (i == index) { // 当前遍历到的列表项是被滑动的那一项
        if (touchMoveX > startX) // 右滑不生效，不显示删除按钮，适用于左滑后再右滑恢复原状
          v.isTouchMove = false
        else // 左滑生效，显示删除按钮
          v.isTouchMove = true
      }
    })
    that.setData({ // 更新数据
      list: that.data.list
    })
  },

  // 删除事件
  del: function (e) {
    var index = e.currentTarget.dataset.index; // 要删除的消费类型的索引
    app.globalData.typelist.splice(index, 1);
    this.setData({ // 更新页面数据
      list: app.globalData.typelist
    });
    console.log('删除后全局的消费类型', app.globalData.typelist)

    // 提示删除成功
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 500
    });
  }

})
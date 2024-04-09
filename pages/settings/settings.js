// 设置页settings.js

// 获取应用实例
var app = getApp()
// 获取全局默认的消费类型
var typelist = app.globalData.typelist;
// 创建音频对象
var audioCtx = wx.createInnerAudioContext();

Page({
  // 页面初始数据
  data: {
    modalHidden: true, // 隐藏新增类型模态框
    modalHidden2: true, // 隐藏重命名类型模态框
    temptitle: '', // 临时标题
    list: [] // 消费类型列表
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    // var typelist = app.globalData.typelist;
    // 将每项的isTouchMove设为false
    typelist.forEach(function (item) {
      item.isTouchMove = false;
    });
    // 更新页面数据，将处理后的typelist赋值给list
    this.setData({
      list: typelist
    });
    console.log('消费类型：', this.data.list);
  },

  // 用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '小账本', // 分享标题
      desc: '快来康康!!', // 分享描述
      path: '/pages/index/index' // 分享路径
    }
  },

  // 新增类型模态框-显示
  showModal: function (e) {
    this.setData({
      modalHidden: !this.data.modalHidden
    });
  },

  // 新增/修改消费类型名
  setTitle: function (e) {
    this.setData({
      temptitle: e.detail.value // 将用户输入的内容保存到 temptitle
    });
  },

  // 新增消费类型模态框-确认
  modalBindaconfirm: function (e) {
    var newTitle = this.data.temptitle.trim(); // 获取新消费类型标题并去除首尾空格
    // 计算输入的字符数量，一个中文字符等于两个英文字符
    var length = newTitle.replace(/[\u0391-\uFFE5]/g, "aa").length;
    // 计算字符长度是否超过限制
    if (length > 4) { // 最多2个中文字或4个的英文字
      wx.showToast({
        title: '不能超过2个中文字或4个英文字!',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 检查是否存在同名的消费类型
    var isDuplicate = typelist.some(item => item.typetitle === newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '不能重复或无更改!',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 生成唯一的 ID
    var newId = Date.now(); // 使用当前时间戳作为 ID
    app.globalData.typelist.push({ // 将新项添加到全局列表末尾
      typeid: newId,
      typetitle: newTitle,
      selected: false,
      isTouchMove: false
    });
    // 关闭模态框，清空输入框，更新消费类型
    this.setData({
      modalHidden: true,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: app.globalData.typelist
    });
    console.log('新增消费类型成功√')
    this.onShow(); // 重新加载页面数据
    // 播放提交音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E6%8F%90%E4%BA%A4.mp3';
    audioCtx.play();
  },

  // 新增类型模态框-取消
  modalBindcancel: function () {
    this.setData({
      modalHidden: !this.data.modalHidden, // 关闭模态框
    })
  },

  // 重命名模态框-显示
  showModal2: function (e) {
    var tempindex = e.currentTarget.dataset.index // 获取当前项索引
    var temptitle = this.data.list[tempindex].typetitle // 获取当前项标题
    this.setData({
      modalHidden2: !this.data.modalHidden2, // 显示模态框
      temptitle: temptitle, // 消费类型名
      tempindex: tempindex // 消费类型索引
    })
  },

  // 重命名模态框-确认
  modalBindaconfirm2: function () {
    var index = this.data.tempindex // 获取需要重命名的项的索引
    var newTitle = this.data.temptitle.trim(); // 获取新消费类型标题并去除首尾空格
    // 计算输入的字符数量，一个中文字符等于两个英文字符
    var length = newTitle.replace(/[\u0391-\uFFE5]/g, "aa").length;
    // 计算字符长度是否超过限制
    if (length > 4) { // 最多2个中文字或4个英文字
      wx.showToast({
        title: '不能超过2个中文字或4个英文字!',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 检查是否存在同名的账本
    var isDuplicate = app.globalData.typelist.some(item => item.typetitle === newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '消费类型不能重复!',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 修改该项全局名
    app.globalData.typelist[index].typetitle = this.data.temptitle

    // 初始化按钮位置，此行要写在setData前面
    app.globalData.typelist[index].isTouchMove = false;

    // 关闭模态框，清空输入框，更新数据
    this.setData({
      modalHidden2: !this.data.modalHidden2,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: app.globalData.typelist
    })

    // 将更新后的列表数据存储到全局
    wx.setStorageSync(' app.globalData.typelist', app.globalData.typelist)
    console.log('重命名消费类型成功√')
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
    var deltypeid = e.currentTarget.dataset.typeid; // 获取要删除的消费类型的 id
    console.log("我要删除的消费类型id:", deltypeid); // 检查获取到的消费类型 id 是否正确
    var rawlist = wx.getStorageSync('cashflow') || [];
    var self = this;
    // 删除提示
    wx.showModal({
      title: '提示',
      content: '删除类型后，该类型下的数据将全部被清除，确定要删除吗？',
      confirmText: '确定',
      cancelText: '取消',
      success(res) {
        if (res.confirm) { // 确定删除
          console.log('删除消费类型前的本地存储', rawlist)
          var newRawList = rawlist.map(account => {
            var newAccount = {
              items: account.items.filter(expense => {
                var typeid = expense.typeid;
                if (typeid !== deltypeid) {
                  return true;
                } else {
                  console.log('符合删除条件的消费类型id', typeid);
                  return false;
                }
              })
            };
            return newAccount;
          });

          console.log('删除消费类型后的本地存储', newRawList)
          // 更新本地存储中的消费记录
          wx.setStorageSync('cashflow', newRawList);
          // 从全局的消费类型列表中找到被删除的消费类型的索引
          var indexToDelete = app.globalData.typelist.findIndex(item => item.typeid === deltypeid);
          if (indexToDelete !== -1) { // 如果找到了要删除的索引
            // 删除被删除的消费类型
            app.globalData.typelist.splice(indexToDelete, 1);
          }
          // 更新页面数据
          self.setData({
            list: app.globalData.typelist
          });

          // 提示删除成功
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          });

          // 播放删除音效
          audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E5%88%A0%E9%99%A4.mp3';
          audioCtx.play();

          // 重新加载页面数据
          self.onShow();
        } else if (res.cancel) {
          // 用户点击了取消按钮
          console.log('用户点击了取消按钮');
        }
      }
    });
  }



})
// 首页index.js

// 获取应用实例
var app = getApp()
// 从本地存储中获取账单数据，如果不存在则设置为空数组
var rawlist = wx.getStorageSync('cashflow') || [];
// 导入云数据库模块
var db = wx.cloud.database();
// 创建音频对象
var audioCtx = wx.createInnerAudioContext();

// 过滤获取当前用户的数据
function filterDataByUserName() {
  var rawlist = wx.getStorageSync('cashflow') || [];
  // console.log('所有本地数据',rawlist)
  const userName = app.globalData.loggedInUserName; // 获取当前用户的userName
  // console.log('userName', userName)
  // 只保留当前用户的数据
  rawlist = rawlist.filter(function (item) {
    return item.userName == userName;
  });
  // console.log('当前用户的本地数据',rawlist)
  return rawlist;
}

Page({
  data: { // 页面初始数据
    modalHidden1: true, // 默认隐藏新增账目模态框
    modalHidden2: true, // 默认隐藏设置模态框
    modalHidden3: true, // 默认隐藏昵称模态框
    temptitle: '', // 临时标题
    tempindex: '', // 临时索引
    list: [], // 账本列表
    // 默认头像url
    avatarUrl: 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/imag/avatar.png',
    // avatarUrl: 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/imag/kuromi.jpg',
    nickname: "可点击修改", // 用户昵称
  },

  // 第一次从数据库取数据
  onLoad: function () {
    const userName = app.globalData.loggedInUserName;
    console.log('userName',userName)
    // 调用云函数获取特定用户的数据
    wx.cloud.callFunction({
      name: 'getUserData', // 云函数名称
      data: {
        userName: userName // 传入用户名作为参数
      },
      success: res => {
        console.log('getUserData云函数调用成功');
        const data = res.result;
        if (data && Array.isArray(data)) {
          // 将每项的 isTouchMove 设为false
          data.forEach(function (item) {
            item.isTouchMove = false;
          });
          console.log('数据库数据data', data)
          // 将数据库数据存入本地
          wx.setStorageSync('cashflow', data);
          console.log('本地数据rawlist', rawlist)
          // 更新页面数据
          this.setData({
            list: data,
          });
        } else {
          console.error('getUserData返回的数据结构错误');
        }
      },
      fail: err => {
        console.error('getUserData云函数调用失败', err);
      }
    });

    // 调用云函数获取用户信息
    wx.cloud.callFunction({
      name: 'getUserInfo', // 云函数名称
      data: {
        userName: userName // 传入用户名作为参数
      },
      success: res => {
        console.log('getUserInfo云函数调用成功');
        const userInfo = res.result;
        if (userInfo) {
          this.setData({ // 更新页面数据
            avatarUrl: userInfo.avatarUrl,
            nickname: userInfo.nickName
          });
          console.log('数据库userInfo',userInfo);
          wx.setStorageSync('userinfo', userInfo);
        } else {
          console.error('getUserInfo返回的数据为空');
        }
      },
      fail: err => {
        console.error('getUserInfo云函数调用失败', err);
      }
    });
  },

  // 监听页面显示，将当前用户的本地数据rawlist同步到数据库
  onShow: function () {
    console.log('我是主index的onShow');
    var rawlist = wx.getStorageSync('cashflow') || [];
    console.log('本地数据rawlist', rawlist)
    var rawlist = filterDataByUserName();
    // 将当前用户的 rawlist 每项的 isTouchMove 设为false
    rawlist.forEach(function (item) {
      item.isTouchMove = false;
    });
    console.log('过滤后，当前用户的本地数据rawlist', rawlist)
    var userinfo = wx.getStorageSync('userinfo') || [];
    console.log('本地userinfo', userinfo)
    console.log('本地nickName', userinfo[0].nickName);
    this.setData({
      list: rawlist,
      nickname: userinfo[0].nickName
    });
    // 将本地数据同步到数据库中
    this.syncDataToCloud();

  },

  // ----
  // 将本地数据同步到数据库中
  syncDataToCloud: function () {
    var rawlist = filterDataByUserName();
    const userName = app.globalData.loggedInUserName;
    console.log('userName', userName);
    // 调用云函数
    wx.cloud.callFunction({
      name: 'syncDataToCloud', // 云函数名称
      data: {
        rawlist: rawlist, // 传递本地账本记录
        userName: userName // 传递用户的 userName
      },
      success: function (res) {
        console.log('syncDataToCloud云函数调用成功');
      },
      fail: function (err) {
        console.error('syncDataToCloud云函数调用失败', err);
      }
    });
  },

  // 查询数据库中的数据
  queryDatabaseData: function () {
    wx.cloud.callFunction({
      name: 'queryDatabaseData',
      success: res => {
        console.log('queryDatabaseData云函数调用成功');
        const data = res.result; // 获取返回的数据
        console.log('数据库的cashflow：', data);
        this.setData({
          databaseData: data // 更新页面数据
        });
      },
      fail: err => {
        console.error('queryDatabaseData云函数调用失败', err);
      }
    });
  },

  // ----
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
        console.log(tempFilePaths);
        wx.setStorageSync('avatarFilePath', tempFilePaths);
        that.updateUserInfo(null, tempFilePaths);
      }
    });
  },

  // ----
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
    wx.setStorageSync('nickname', newNickname);
    this.updateUserInfo(newNickname, null);
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

  // 更新数据库的头像和昵称
  updateUserInfo: function (newNickname, newAvatar) {
    const userName = wx.getStorageSync('userInfo').userName; // 获取当前用户的userName

    wx.cloud.callFunction({
      name: 'updateUserInfo', // 云函数名称
      data: {
        userName: userName, // 当前用户的userName
        newNickname: newNickname, // 新昵称
        newAvatar: newAvatar // 新头像URL
      },
      success: res => {
        console.log('更新用户信息成功', res);
      },
      fail: err => {
        console.error('更新用户信息失败', err);
      }
    });
  },

  // ----
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
    var rawlist = filterDataByUserName();
    // 检查是否存在同名的账本
    var isDuplicate = rawlist.some(item => item.title === newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '账本名不能重复!',
        icon: 'none',
      });
      return;
    }
    // var timestamp = new Date().getTime().toString(); // 获取当前时间戳并转换为字符串
    // 获取本地缓存中的userInfo对象
    var userName = app.globalData.loggedInUserName; // 获取当前用户的userName
    rawlist.push({ // 无重名则将新账本添加到本地存储列表末尾
      title: newTitle,
      id: rawlist.length,
      // id2: timestamp, // 使用时间戳作为唯一ID
      userName: userName,
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

  // ----
  // 重命名模态框-显示
  showModal2: function (e) {
    var tempindex = e.currentTarget.dataset.index // 获取当前项索引
    var temptitle = this.data.list[tempindex].title // 获取当前项标题
    var rawlist = filterDataByUserName();
    this.setData({
      modalHidden2: !this.data.modalHidden2, // 显示模态框
      temptitle: temptitle, // 帐本名
      tempindex: tempindex // 账本索引
    })
    console.log('打开重命名框时出现该账本的消费记录:', rawlist[tempindex].items);
  },

  // 重命名模态框-确认
  modalBindconfirm2: function () {
    var index = this.data.tempindex; // 获取需要重命名的项的索引
    // 获取旧账本名
    var rawlist = filterDataByUserName();
    var oldTitle = rawlist[index].title;
    console.log('旧账本名', oldTitle)
    // 获取新账本标题
    var newTitle = this.data.temptitle;
    // 检查是否存在同名的账本
    var isDuplicate = rawlist.some(item => item.title == newTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '账本名不能重复或无更改!',
        icon: 'none',
      });
      return;
    }
    console.log('点击确定重命名后出现的该账本消费记录:', rawlist[index].items);

    rawlist[index].title = newTitle; // 修改账本名
    wx.setStorageSync('cashflow', rawlist); // 更新本地缓存

    // 删除数据库中旧账本名对应的数据
    this.deleteDataFromCloud(oldTitle);

    // 关闭模态框，清空输入框，更新数据
    this.setData({
      modalHidden2: !this.data.modalHidden2,
      temptitle: '', // 清空输入框中的内容,不清空下次点开还存有上次的数据
      list: rawlist
    });
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

  // ----
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
      if (i === index) { // 当前遍历到的列表项是被滑动的那一项
        if (touchMoveX > startX) {
          // 右滑不生效，不显示按钮，也适用于左滑后再右滑恢复原状
          v.isTouchMove = false;
        } else { // 左滑生效，显示按钮
          v.isTouchMove = true;
        }
      } else { // 非当前滑动的列表项，隐藏按钮
        v.isTouchMove = false;
      }
    });
    that.setData({ // 更新数据
      list: that.data.list // 账本
    });
  },

  // ----
  // 删除事件
  del: function (e) {
    var rawlist = filterDataByUserName();
    var index = e.currentTarget.dataset.index // 获取要删除的列表项的索引
    console.log('要删除的账本', index, rawlist)
    // 获取要删除项的title
    var title = rawlist[index].title;
    rawlist.splice(index, 1); // 从原始数据中删除对应索引的数据
    this.setData({ // 更新数据
      list: rawlist
    })
    // 将更新后的列表数据存储到本地缓存
    wx.setStorageSync('cashflow', rawlist)
    // 删除数据库中对应的数据
    this.deleteDataFromCloud(title);
    wx.showToast({ // 提示框
      title: '删除成功',
      icon: 'success',
      duration: 500
    });
    console.log('本地数据删除账本成功√')
    this.onShow(); // 重新加载页面数据
    // 播放删除音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E5%88%A0%E9%99%A4.mp3';
    audioCtx.play();
  },

  // 删除数据库中对应的数据
  deleteDataFromCloud: function (title) {
    const userName = app.globalData.loggedInUserName; // 获取当前用户的userName
    wx.cloud.callFunction({
      name: 'deleteDataFromCloud', // 云函数名称
      data: {
        userName: userName,
        title: title // 传递账本名称作为参数
      },
      success: function (res) {
        console.log('deleteDataFromCloud云函数调用成功√');
        // 在成功回调中执行其他操作
      },
      fail: function (err) {
        console.error('deleteDataFromCloud云函数调用失败', err);
      }
    });
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
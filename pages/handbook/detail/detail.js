//支出信息 handbook > detail.js

// 获取全局应用实例
var app = getApp();
// 获取全局消费类型列表
var typelist = app.globalData.typelist;
// 获取当前日期
var currentDate = new Date();
var currentTime = new Date();
// 创建音频对象
var audioCtx = wx.createInnerAudioContext();

Page({
  // 页面初始化数据
  data: {
    act: 'new', // 操作类型，'new'表示新建，'edit'表示编辑
    mainindex: 0, // 主索引，哪个账本
    subindex: 0, // 子索引，具体账本的消费信息的索引
    subtitle: '', // 消费信息的标题
    typeid: 0, // 消费类型索引
    comment: '', // 备注
    cost: '', // 消费金额,注意如果这里变成 cost:0 ,那么需要手动删掉0再输入值
    date: '0000-00-00', // 日期
    time: '00:00', // 时间
    typelist: [], // 消费类型列表
    list: []
  },

  // 生命周期函数--监听页面加载
  // 只加载一次，onLoad 可以获取页面跳转时传递的参数 params
  onLoad: function (params) {
    if (params.act == 'new') { // 新建
      // 消费类型默认选中第0个
      for (let i = 1; i < typelist.length; i++) {
        typelist[i].selected = false;
      }
      typelist[0].selected = true;
      // 格式化日期YYYY-MM-DD，确保是两位数
      var year = currentDate.getFullYear();
      var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      // 月份从0开始，需要加1，padStart用于补零
      var day = currentDate.getDate().toString().padStart(2, '0');
      var formattedDate = year + '-' + month + '-' + day;
      // console.log('格式化后的日期',formattedDate);
      this.setData({
        act: 'new', // 新建（初始化选中的消费类型，时间，日期）
        mainindex: params.mainindex, // 主索引，选择哪个账目
        typeid: typelist[0].typeid, // 使用 typelist 中第一个元素的 typeid
        date: formattedDate, // 页面加载时更新日期（只更新一次）
      });
    } else { // 编辑
      // 循环遍历，将上次操作的消费类型设为选中状态
      var typeid = params.typeid;
      for (let i = 0; i < typelist.length; i++) {
        if (typelist[i].typeid == typeid) {
          typelist[i].selected = true;
        } else {
          typelist[i].selected = false;
        }
      }
      this.setData({
        act: 'edit', // 编辑（保持上一次的操作）
        mainindex: params.mainindex, // 主索引，选择哪个账目
        subindex: params.subindex, // 子索引，账单里的消费记录
        typeid: params.typeid, // 消费类型的索引
        subtitle: params.subtitle, // 消费标题
        comment: params.comment, // 备注
        cost: params.cost, // 费用
        date: params.date, // 日期
        time: params.time, // 时间
        typelist: typelist, // 更新消费类型列表
      });
    }
  },

  // 生命周期函数---监听页面显示
  onShow: function () {
    // 获取当前时间
    var currentTime = new Date();
    // 调用 formatTime 方法格式化时间
    var formattedTime = this.formatTime(currentTime);
    this.setData({
      typelist: app.globalData.typelist,
      time: formattedTime // 页面显示时刷新时间（可多次刷新）
    });
  },

  // 定义一个函数用于格式化时间
  formatTime: function (date) {
    // 获取小时和分钟
    var hours = date.getHours();
    var minutes = date.getMinutes();
    // 格式化小时和分钟，确保是两位数，并用":"连接
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    var formattedTime = hours + ':' + minutes;
    return formattedTime;
  },

  // 显示选中的消费类型按钮
  selectType: function (e) {
    var typeid = e.currentTarget.dataset.typeid;
    this.setData({
      typeid: typeid
    });
    for (let i = 0; i < this.data.typelist.length; i++) {
      if (this.data.typelist[i].typeid == typeid) {
        this.data.typelist[i].selected = true;
      } else {
        this.data.typelist[i].selected = false;
      }
    }
    this.setData({
      typelist: this.data.typelist
    });
  },

  // 监听 日期 选择器的选择改变事件
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 监听 时间 选择器的选择改变事件
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },

  // 监听 表单提交事件：默认携带用户输入数据，而不会携带页面中其他的数据
  formSubmit: function (e) {
    var rawlist = wx.getStorageSync('cashflow') || [];
    var typeTitle = this.getTypeTitle(this.data.typeid);
    if (this.data.act == 'new') { // 新增，就 push 进去
      // e.detail.value 是事件对象 e 中的一个属性，用于获取事件触发时输入框中的值
      // 下面的信息看起来是重复的，但其实每个数据都不一样
      var newExpense = {
        mainindex: this.data.mainindex,
        subtitle: e.detail.value.title,
        typeid: this.data.typeid,
        typetitle: typeTitle,
        cost: e.detail.value.cost || '0',
        comment: e.detail.value.comment,
        date: e.detail.value.date,
        time: e.detail.value.time
        // e.detail.value 获取用户在表单中输入的值
        // this.data 页面的 data 对象中存储的数据
      };
      // 将新消费记录添加到现金流数据中
      rawlist[this.data.mainindex].items.push(newExpense);
    } else { // 编辑，更新已有的数据
      rawlist[this.data.mainindex].items[this.data.subindex] = {
        mainindex: this.data.mainindex,
        subtitle: e.detail.value.title,
        typeid: this.data.typeid,
        typetitle: typeTitle,
        cost: e.detail.value.cost || '0',
        comment: e.detail.value.comment,
        date: e.detail.value.date,
        time: e.detail.value.time
      };
    }
    // 按照时间的顺序排列消费记录
    rawlist[this.data.mainindex].items.sort(function (a, b) {
      var date1 = a.date + ' ' + a.time;
      var date2 = b.date + ' ' + b.time;
      console.log('date1', date1)
      console.log('date2', date2)
      if (date1 === date2) {
        // 如果日期时间相同，将 b 放在前面，即返回 -1
        return -1;
      } else {
        // 否则按照日期时间降序排列
        return date2.localeCompare(date1);
      }
      // 将日期和时间合并为字符串，然后使用 localeCompare 方法进行比较，支出信息列表将按照日期和时间的降序进行排序，即最新的排在最上面
      // 返回值为负数、零或正数，表示 date2 在排在 date1 之前、相同或之后
    });
    wx.setStorageSync('cashflow', rawlist); // 将现金流数据保存在本地缓存中

    // 获取、添加、提交表单数据
    // 添加是因为默认“只会”携带用户“输入的数据”，而“不会”携带页面中“其他的数据”
    var formData = e.detail.value;
    formData.typeid = this.data.typeid;
    formData.typetitle = typeTitle;
    formData.mainindex = this.data.mainindex;
    console.log('提交了一则支出信息到本地缓存：', formData);

    // 播放音效
    audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E6%8F%90%E4%BA%A4.mp3';
    audioCtx.play();

    // 退回上一页
    wx.navigateBack({
      delta: 1, // 要返回的页面数
      success: function () {
        // console.log('返回上个页面成功')
      },
      fail: function () {
        // console.log('返回上个页面失败')
      }
    });
  },

  // 根据 typeid 获取消费类型标题 type.title 的函数
  getTypeTitle: function (typeid) {
    for (var i = 0; i < this.data.typelist.length; i++) {
      var type = this.data.typelist[i];
      if (type.typeid == typeid) {
        return type.title; // 找到就返回type.title
      }
    }
    return ''; // 找不到返回空
  },

})
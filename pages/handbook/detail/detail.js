//支出信息handbook>detail.js

var app = getApp(); // 获取全局应用实例
var util = require('../../../utils/util.js'); // 引入工具

var typelist = app.globalData.typelist;

Page({
  // 页面初始化数据
  data: {
    act: 'new', // 操作类型，'new'表示新建，'edit'表示编辑
    mainindex: 0, // 主索引，哪个账本
    subindex: 0, // 子索引，具体账本的消费信息的索引
    subtitle: '', // 消费信息的标题
    typeindex: 0, // 支出类型索引
    comment: '', // 备注
    cost: '', // 消费金额
    date: '2024-03-01', // 日期
    time: '12:11', // 时间
    typelist: typelist, // 消费类型列表
    list: []
  },

  // 生命周期函数--监听页面加载，只加载一次
  // onLoad 可以获取页面跳转时传递的参数params
  onLoad: function (params) {

    if (params.act === 'new') { // 如果操作类型为 新建
      // 获取当前日期和时间
      var dateTime = util.getCurrentDateTime();
      var currentDate = dateTime.currentDate;
      var currentTime = dateTime.currentTime;
      // 更新页面
      this.setData({
        act: 'new', // 新建
        mainindex: params.mainindex, // 主索引，选择哪个账目
        typeindex: 0, // 消费类型索引
        date: currentDate,
        time: currentTime
      });
    } else { // 编辑
      // 循环遍历，将上次操作的消费类型设为选中状态
      var typeindex = params.typeindex;
      for (let i = 0; i < typelist.length; i++) {
        if (i == typeindex) { // 注意这里不能用===，否则无效，===比较值和类型
          typelist[i].selected = true;
        } else {
          typelist[i].selected = false;
        }
      }

      // 更新页面数据
      this.setData({
        act: 'edit', // 操作类型为编辑
        mainindex: params.mainindex, // 主索引，选择哪个账目
        subindex: params.subindex, // 子索引，账目里的消费记录
        typeindex: params.typeindex, // 消费类型的索引
        subtitle: params.subtitle, // 消费标题
        comment: params.comment, // 备注
        cost: params.cost, // 费用
        date: params.date, // 日期
        time: params.time, // 事件
        typelist: typelist, // 更新消费类型列表
        isInputFocus: true
      });
      console.log('focus',isInputFocus)
    }
  },
  // 生命周期函数--监听页面显示
  // 非常重要，onShow会重新获取全局的消费类型列表并更新typelist
  // 否则你修改了setting里的内容，detail页面没有任何变化，因为onLoad只会加载一次
  onShow: function () {
    // 页面显示时更新 typelist
    this.setData({
      typelist: app.globalData.typelist
    });
  },

  // 显示选中的消费类型按钮
  selectType: function (e) {
    var typeindex = e.currentTarget.dataset.index;
    this.setData({
      typeindex: typeindex
    });
    for (let i = 0; i < typelist.length; i++) {
      if (i == typeindex) {
        typelist[i].selected = true;
      } else {
        typelist[i].selected = false;
      }
    }
    // 更新页面数据，否则被选中的按钮没有变色
    this.setData({
      typelist: typelist
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
    var list = wx.getStorageSync('cashflow') || []; // 获取本地存储的所有账目的现金流数据，如果不存在则初始化为一个空数组

    if (this.data.act == 'new') { // 新增，就push进去
      // 创建新的支出信息对象
      // e.detail.value 是事件对象e中的一个属性，用于获取事件触发时输入框中的值
      // 下面的信息看起来是重复的，但其实每个数据都不一样
      var newExpense = {
        mainindex: this.data.mainindex,
        subtitle: e.detail.value.title,
        typeindex: this.data.typeindex, // 从页面的data对象中获取 typeindex
        cost: e.detail.value.cost || '0',
        comment: e.detail.value.comment,
        date: e.detail.value.date,
        time: e.detail.value.time
      };
      // 将新支出信息添加到现金流数据中
      list[this.data.mainindex].items.push(newExpense);
    } else { // 编辑，更新已有的数据
      list[this.data.mainindex].items[this.data.subindex] = {
        mainindex: this.data.mainindex, // 从页面的data对象中获取
        subtitle: e.detail.value.title,
        typeindex: this.data.typeindex,
        cost: e.detail.value.cost || '0',
        comment: e.detail.value.comment,
        date: e.detail.value.date,
        time: e.detail.value.time
      };
    }
    // 按照时间的顺序排列消费记录
    list[this.data.mainindex].items.sort(function (a, b) {
      var date1 = a.date + ' ' + a.time;
      var date2 = b.date + ' ' + b.time;
      return date2.localeCompare(date1);
      // 将日期和时间合并为字符串，然后使用localeCompare方法进行比较，支出信息列表将按照日期和时间的降序进行排序，即最新的排在最上面
      // 返回值为负数、零或正数，表示date2在排在date1之前、相同或之后
    });

    wx.setStorageSync('cashflow', list); // 一定要记得更新现金流数据

    // 获取、添加、提交表单数据
    // 添加是因为默认只会携带用户 输入的数据，而不会携带页面中其他的数据
    var formData = e.detail.value;
    formData.typeindex = this.data.typeindex;
    formData.mainindex = this.data.mainindex;
    formData.date = this.data.date.substring(5);
    console.log('提交了一则支出信息：', formData);

    var audioCtx = wx.createInnerAudioContext(); // 创建音频对象
    // 播放音效
    audioCtx.src = '/pages/common/audio/提交.mp3'; // 设置音频资源的地址
    audioCtx.play(); // 播放音频

    // 退回上一页
    wx.navigateBack({
      delta: 1, // 要返回的页面数
      success: function () {
        console.log('返回上个页面成功')
      },
      fail: function () {
        console.log('返回上个页面失败')
      }
    });
  }

})
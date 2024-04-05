 // 获取全局应用实例
 var app = getApp();
 // 获取当前日期的年份
 var currentYear = new Date().getFullYear();
 // 创建音频对象
 var audioCtx = wx.createInnerAudioContext();

 Page({
   data: {
     mainindex: '', // 主索引
     zbtitle: '', // 账本名
     typelist: app.globalData.typelist, // 消费类型列表
     navigatorTitle: '', // 导航栏标题
     currentYear: currentYear, // 当前年份
     sum: 0, // 该账本总花费
     sublist: [], // 账本下的消费记录
     date: ""
   },

   // 生命周期函数--监听页面显示
   onLoad: function (params) {
     var rawlist = wx.getStorageSync('cashflow') || [];
     this.setData({
       mainindex: params.index, // 设置主索引为参数中的索引值
       navigatorTitle: rawlist[params.index] ? rawlist[params.index].title : '', // 设置该页面导航栏标题为对应账本的标题,此判断非常重要,适用于新建账本,然后点进该帐本,此时是没数据的,会出现undefined
       zbtitle: rawlist[params.index] ? rawlist[params.index].title : '', // 设置账本名
     });
     // 设置页面导航栏标题
     wx.setNavigationBarTitle({
       title: this.data.navigatorTitle,
     });
     console.log('导航标题', this.data.navigatorTitle)
     // 存储在本地缓存中，方便charts页面调用
     wx.setStorageSync('pageTitle', this.data.navigatorTitle);
   },

   // 生命周期函数--监听页面显示
   onShow: function () {
     var rawlist = wx.getStorageSync('cashflow') || []; // 本地数据
     var sublist = rawlist[this.data.mainindex].items; // 消费记录
     console.log('该账单下的消费记录：', sublist)

     // 计算 总花费 及 各消费类型的总花费
     var sum = 0;
     var sumByType = {};
     // 初始化每个typeid的title为空，总花费amount为0
     sublist.forEach(function (item) {
       var typeid = item.typeid;
       sumByType[typeid] = {
         title: '', // 消费类型标题
         amount: 0 // 消费金额
       };
     });

     // 计算每个typeid的总花费，遍历所有消费记录
     sublist.forEach(function (item) {
       var typeid = item.typeid;
       var cost = parseFloat(item.cost);
       sum += cost; // 总花费，累加每条消费记录的花费
       sumByType[typeid].amount += cost; // 各消费类型的总花费，累加每个 typeid 对应的总花费
     });

     // 遍历 typelist ，为 sumByType 中的每个 typeid 存储标题
     app.globalData.typelist.forEach(function (type) {
       var typeid = type.typeid;
       if (sumByType[typeid]) { // 如果 sumByType 中存在该 typeid，则存储标题
         sumByType[typeid].title = type.title;
       }
     });

     // 判断该日期是否与前一个日期相同
     sublist.forEach(function (item, index) {
       // 第一条数据默认与上一条数据日期不同
       if (index === 0) {
         item.showDate = true; // true 显示日期
       } else {
         item.showDate = item.date !== sublist[index - 1].date;
       }
     });

     // 更新页面数据
     this.setData({
       sum: sum.toFixed(1), // 总花费（保留一位小数）
       sublist: sublist, // 消费记录
       sumByType: sumByType, // 各消费类型的总花费
       //  typelist: app.globalData.typelist, // 消费类型
     });
   },

   // 跳转到图标页面，携带sumByType和sum数据
   goToChartsPage: function () {
     wx.navigateTo({
       url: '../charts/charts?sumByType=' + JSON.stringify(this.data.sumByType) + '&sum=' + this.data.sum
     });
   },

   // 手指开始触摸屏幕时触发，记录触摸的起始位置的 X 坐标
   touchstart: function (e) {
     this.setData({ // 更新页面数据
       startX: e.changedTouches[0].clientX, // 记录起始X坐标
       sublist: this.data.sublist // 消费记录
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
         if (touchMoveX > startX)
           // 右滑不生效，不显示按钮，也适用于左滑后再右滑恢复原状
           v.isTouchMove = false
         else // 左滑生效，显示按钮
           v.isTouchMove = true
       }
     });
     that.setData({ // 更新页面数据
       sublist: that.data.sublist // 消费记录
     });
   },

   // 删除事件处理
   del: function (e) {
     var rawlist = wx.getStorageSync('cashflow') || [];
     var index = e.currentTarget.dataset.index; // 获取要删除的索引
     rawlist[this.data.mainindex].items.splice(index, 1); // 删除该账本下的该消费记录
     this.setData({ // 更新页面数据
       sublist: rawlist[this.data.mainindex].items
     });
     wx.setStorageSync('cashflow', rawlist); // 更新本地存储中的数据
    //  console.log('删除该消费记录后,该账本的消费记录:', this.data.sublist)
     wx.showToast({ // 弹出删除成功提示
       title: '删除成功',
       icon: 'success',
       duration: 500
     });

     // 播放音效
     audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E5%88%A0%E9%99%A4.mp3';
     audioCtx.play();

     // 重新加载页面数据
     this.onShow();
   },

   // 用户点击右上角分享
   onShareAppMessage: function () {
     return {
       title: '超方便的小账本', // 分享标题
       desc: '快来康康!!', // 分享描述
       path: '/pages/index/index' // 分享路径
     }
   },
 });
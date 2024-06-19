 // 获取全局应用实例
 var app = getApp();
 // 获取当前日期的年份
 var currentYear = new Date().getFullYear();
 // 创建音频对象
 var audioCtx = wx.createInnerAudioContext();
 //  var rawlist = wx.getStorageSync('cashflow') || [];

 Page({
   data: {
     mainindex: '', // 主索引
     mainindex2: '', // 唯一主索引
     budgetHidden: true, // 默认隐藏预算模态框
     zbtitle: '', // 账本名
     typelist: app.globalData.typelist, // 消费类型列表
     navigatorTitle: '', // 导航栏标题
     currentYear: currentYear, // 当前年份
     sum: 0, // 该账本总花费
     items: [], // 账本下的消费记录
     date: ""
   },

   // 导出为纯文本文档
   exportRecord: function () {
     // 初始化文本内容，包含表头信息
     let textContent = '日期\t\t类型\t金额\n';
     // 遍历每个消费条目，将日期、类型和金额添加到文本内容中
     this.data.items.forEach(function (item) {
       textContent += item.date + '\t' + item.typetitle + '\t' + item.cost + '\n';
     });
     // 添加账本总花费和本月各消费类型总花费的信息
     textContent += '-----------------\n';
     textContent += '本月总花费：' + this.data.curMonSum + '元\n';
     textContent += '本月各消费类型总花费：\n';
     for (let typeid in this.data.monSumByType) {
       textContent += this.data.monSumByType[typeid].typetitle + '：' + this.data.monSumByType[typeid].curMonAmount + '元\n';
     }

     // 添加此账本总花费和此账本各消费类型总花费的信息
     textContent += '-----------------\n';
     textContent += '此账本总花费：' + this.data.sum + '元\n';
     textContent += '此账本各消费类型总花费：\n';
     for (let typeid in this.data.sumByType) {
       textContent += this.data.sumByType[typeid].typetitle + '：' + this.data.sumByType[typeid].amount + '元\n';
     }
     // 将文本内容保存到剪贴板
     wx.setClipboardData({
       data: textContent,
       success(res) {
         // 提示用户导出成功
         wx.showToast({
           title: '文本已复制',
           icon: 'success',
           duration: 1000
         });
       },
       fail(err) {
         console.error('复制文本失败', err);
         // 提示用户导出失败
         wx.showToast({
           title: '复制失败',
           icon: 'none',
           duration: 1000
         });
       }
     });
   },

   // 监听页面显示：账本名，导航栏标题
   onLoad: function (params) {
     var rawlist = wx.getStorageSync('cashflow') || [];
     this.setData({
       mainindex: params.index, // 设置主索引为参数中的索引值
       mainindex2: rawlist[params.index].id2,
       navigatorTitle: rawlist[params.index].title,
       zbtitle: rawlist[params.index] ? rawlist[params.index].title : '',
     });
     // 设置页面导航栏标题
     wx.setNavigationBarTitle({
       title: this.data.navigatorTitle,
     });
     // 存储在本地缓存中，方便 charts 页面调用
     wx.setStorageSync('pageTitle', this.data.navigatorTitle);
   },

   // 生命周期函数--监听页面显示
   onShow: function () {
     console.log('进入副index')
     var rawlist = wx.getStorageSync('cashflow') || []; // 本地数据
     var items = rawlist[this.data.mainindex].items || []; // 消费记录
     console.log('本地数据：', rawlist)
     // 获取当前页面的索引
     var mainindex = this.data.mainindex;
     console.log('该账本消费记录：', items)

     // ----更新 items 中的 typetitle
     // （重命名消费类型名，此页面已有的消费记录的消费类型名也要同时修改）
     var typelist = app.globalData.typelist;
     items.forEach(function (item) {
       var typeid = item.typeid;
       var type = typelist.find(function (type) {
         return type.typeid == typeid;
       });
       if (type) {
         item.typetitle = type.typetitle;
       }
     });
     console.log('该账单下的消费记录：', items)

     // ----本月预算
     // 获取当前年份和月份
     var currentDate = new Date();
     var budgetObj = rawlist[this.data.mainindex].budget || {}; // 获取该账本的预算对象，如果不存在则初始化为空对象
     var currentYearMonth = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1); // 当前年份和月份，形如"2024-4"
     var MonBudget = budgetObj[currentYearMonth] || '0'; // 在该账本的 budget 属性中查找键为 currentYearMonth 的值
     console.log('本月预算', MonBudget);

     // ----本月消费
     // 获取当前年份和月份
     var currentDate = new Date();
     var currentYear = currentDate.getFullYear();
     var currentMonth = currentDate.getMonth() + 1; // 月份从0开始，需要加1
     var monSumByType = {}; // 当月各类型的总花费
     var curMonSum = 0; // 当月总花费
     // 遍历消费记录，筛选出属于当前年份和月份的记录，并计算总消费金额
     items.forEach(function (item) {
       var date = new Date(item.date);
       var year = date.getFullYear();
       var month = date.getMonth() + 1;
       if (year === currentYear && month === currentMonth) {
         var typeid = item.typeid;
         var cost = parseFloat(item.cost);
         curMonSum += cost; // 累加当月总花费
         if (!monSumByType[typeid]) {
           monSumByType[typeid] = {
             typetitle: '', // 消费类型标题
             curMonAmount: 0 // 当月各类型的总花费
           };
         }
         monSumByType[typeid].typetitle = item.typetitle; // 更新消费类型标题
         monSumByType[typeid].curMonAmount += cost; // 累加当月各类型的总花费
       }
     });
     // 输出当月总花费
     console.log(currentYear, currentMonth, '月消费总额：', curMonSum);
     // 输出当月各类型总花费
     for (var typeid in monSumByType) {
       console.log(currentYear, currentMonth, '月', monSumByType[typeid].typetitle, '总花费：', monSumByType[typeid].curMonAmount);
     }

     // ----所有总花费 及 各消费类型的总花费
     var sum = 0;
     var sumByType = {};
     // 初始化每个 typeid 的 typetitle 为空，总花费 amount 为0
     items.forEach(function (item) {
       var typeid = item.typeid;
       sumByType[typeid] = {
         typetitle: '', // 消费类型标题
         amount: 0 // 消费金额
       };
     });

     // 计算每个typeid的总花费，遍历所有消费记录
     items.forEach(function (item) {
       var typeid = item.typeid;
       var cost = parseFloat(item.cost);
       sum += cost; // 总花费，累加每条消费记录的花费
       sumByType[typeid].amount += cost; // 各消费类型的总花费，累加每个 typeid 对应的总花费
     });

     // ----相同日期不显示
     // 遍历 typelist ，为 sumByType 中的每个 typeid 存储标题
     app.globalData.typelist.forEach(function (type) {
       var typeid = type.typeid;
       if (sumByType[typeid]) { // 如果 sumByType 中存在该 typeid，则存储标题
         sumByType[typeid].typetitle = type.typetitle;
       }
     });

     // 判断该日期是否与前一个日期相同
     items.forEach(function (item, index) {
       // 第一条数据默认与上一条数据日期不同
       if (index === 0) {
         item.showDate = true; // true 显示日期
       } else {
         item.showDate = item.date !== items[index - 1].date;
       }
     });

     // ----计算支出百分比，并保留一位小数
     var percent = ((curMonSum / MonBudget) * 100).toFixed(1);

     console.log('items：', items)
     // 计算当前账本的记账总笔数
     var totalCount = items.length;
     // ----更新页面数据
     this.setData({
       sum: sum.toFixed(1), // 所有总花费（保留一位小数）
       items: items, // 消费记录
       totalCount: totalCount, // 记账总笔数
       sumByType: sumByType, // 各消费类型的总花费
       currentMonth: currentMonth, // 当前月份
       MonBudget: MonBudget, // 每月预算
       curMonSum: curMonSum.toFixed(1), // 当月总消费（保留一位小数）
       percent: percent, // 百分比
       monSumByType: monSumByType, // 当月各类型总消费
       typelist: app.globalData.typelist // 更新消费类型列表
     });
     this.calculateTotalDays();
     this.queryDatabaseData();
   },

   // ----
   // 计算记账总天数
   calculateTotalDays: function () {
     var items = this.data.items; // 获取消费记录
     var dates = []; // 用于存储不同的日期
     // 遍历消费记录，获取日期信息
     items.forEach(function (item) {
       var date = item.date.split(' ')[0]; // 获取日期，去掉时间部分
       if (!dates.includes(date)) { // 如果日期数组中不存在该日期，则添加到数组中
         dates.push(date);
       }
     });
     // 统计日期数组的长度，即为记账总天数
     var totalDay = dates.length;
     // 更新页面数据
     this.setData({
       totalDay: totalDay
     });
   },

   // ----
   // 查询数据库中的数据
   queryDatabaseData: function () {
     wx.cloud.callFunction({
       name: 'queryDatabaseData',
       success: res => {
         console.log('queryDatabaseData云函数调用成功');
         const data = res.result; // 获取返回的数据
         console.log('数据库的数据：', data);
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
   // 预算模态框-显示
   budgetModal: function () {
     this.setData({
       budgetHidden: false // 显示预算模态框
     })
   },

   // 修改预算
   setBudget: function (e) {
     this.setData({
       MonBudget: e.detail.value // 将用户输入的内容保存到 MonBudget
     })
   },

   // 预算模态框-确认
   budgetConfirm: function () {
     var MonBudget = this.data.MonBudget; // 获取预算
     var mainindex = this.data.mainindex; // 获取当前账本的索引
     var currentDate = new Date();
     var currentYearMonth = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1); // 当前年份和月份，形如"2024-4"
     var rawlist = wx.getStorageSync('cashflow') || []; // 本地数据

     // 检查当前账本是否有预算对象，如果没有，则初始化一个空对象
     if (!rawlist[mainindex].budget) {
       rawlist[mainindex].budget = {};
     }
     if (typeof rawlist[mainindex].budget === 'string') {
       rawlist[mainindex].budget = {};
     }

     // 将新的预算信息存储到当前月份对应的账本中
     rawlist[mainindex].budget[currentYearMonth] = MonBudget;

     // 将更新后的数据存储到本地缓存
     wx.setStorageSync('cashflow', rawlist);
     console.log('dsf', rawlist)

     // 关闭模态框，更新本地列表
     this.setData({
       budgetHidden: true // 关闭预算模态框
     });

     // 更新页面数据
     this.onShow();

     // 播放提交音效
     audioCtx.src = 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/audio/%E6%8F%90%E4%BA%A4.mp3';
     audioCtx.play();
   },

   // 预算模态框-取消
   budgetCancel: function () {
     this.setData({
       budgetHidden: true // 关闭预算模态框
     })
   },

   // ----
   // 跳转到图表页面，携带 sumByType、sum、monSumByType 和 curMonSum 数据
   goToChartsPage: function () {
     wx.navigateTo({
       url: '../charts/charts?sumByType=' + JSON.stringify(this.data.sumByType) + '&sum=' + this.data.sum + '&monSumByType=' + JSON.stringify(this.data.monSumByType) + '&curMonSum=' + this.data.curMonSum
     });
   },

   // ----
   // 手指开始触摸屏幕时触发，记录触摸的起始位置的 X 坐标
   touchstart: function (e) {
     this.setData({ // 更新页面数据
       startX: e.changedTouches[0].clientX, // 记录起始X坐标
       items: this.data.items // 消费记录
     });
   },

   // 滑动事件处理
   touchmove: function (e) {
     var that = this,
       index = e.currentTarget.dataset.index, // 当前索引
       startX = that.data.startX, // 滑动的起点位置
       touchMoveX = e.changedTouches[0].clientX; // 滑动过程中的实时位置

     // 遍历账目子项列表
     that.data.items.forEach(function (v, i) {
       if (i == index) { // 当前遍历到的列表项是被滑动的那一项
         if (touchMoveX > startX)
           // 右滑不生效，不显示按钮，也适用于左滑后再右滑恢复原状
           v.isTouchMove = false
         else { // 左滑生效，显示按钮
           v.isTouchMove = true
         }
       } else { // 非当前滑动的列表项，隐藏按钮
         v.isTouchMove = false;
       }
     });
     that.setData({ // 更新页面数据
       items: that.data.items // 消费记录
     });
   },

   // 删除事件处理
   del: function (e) {
     var rawlist = wx.getStorageSync('cashflow') || [];
     var index = e.currentTarget.dataset.index; // 获取要删除的索引
     rawlist[this.data.mainindex].items.splice(index, 1); // 删除该账本下的该消费记录
     this.setData({ // 更新页面数据
       items: rawlist[this.data.mainindex].items
     });
     wx.setStorageSync('cashflow', rawlist); // 更新本地存储中的数据
     //  console.log('删除该消费记录后,该账本的消费记录:', this.data.items)
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
     // 同步数据到云数据库
     //  this.syncDataToCloud();
   },

   // ---------
   // 用户点击右上角分享
   onShareAppMessage: function () {
     return {
       title: '超方便的小账本', // 分享标题
       desc: '快来康康!!', // 分享描述
       path: '/pages/index/index' // 分享路径
     }
   },
 });
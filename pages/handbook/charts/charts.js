// 图表 handbook > charts.js

// 获取全局应用实例
var app = getApp();
// 获取全局消费类型列表
var typelist = app.globalData.typelist;
// 上一次点击的索引
let lastClickedIndex = -1;

Page({
  data: {
    canvasInfo: {}, // 画布信息
    dataList: [], // 将 sumByType 的数据放在这里
    pieInfo: {}, // 饼状图
    sumByType: {}, // 按消费类型分类的总额
    typelist: [], // 消费类型
    lastClickedIndex: -1, // 上一次点击的索引
    colors: ['#ADD8E6', '#EEB4B4', '#B89AF3', '#A3D586', '#FACA6A', '#ACA8A8']
  },

  // 获取并更新总sum和导航标题
  onLoad: function (options) {
    var sum = options.sum; // 解析传递的 sum 参数
    // 获取上一个页面的导航标题
    var previousPageTitle = wx.getStorageSync('pageTitle');
    // 设置当前页面的导航栏标题为上一个页面的导航标题
    wx.setNavigationBarTitle({
      title: previousPageTitle,
    });
    this.setData({
      sum: sum,
      title:previousPageTitle
    });
  },

  // 页面显示时调用
  onShow: function () {
    // 从当前页面的参数中提取 sumByType 数据

    // 获取当前页面栈，包含了所有当前页面的数组
    var pages = getCurrentPages();
    // 获取了当前页面栈中最后一个页面的实例，即当前页面的实例
    var currentPage = pages[pages.length - 1];
    // 将传递过来的 JSON 字符串 sumByType 解析为 JavaScript 对象
    var sumByType = JSON.parse(currentPage.options.sumByType);
    console.log('charts页面接收到的的sumByType:', sumByType);

    this.setData({
      sumByType: sumByType,
      typelist: typelist
    });

    // 将 sumByType 的对象数据转换为与 dataList 相同的结构，并存入 dataList
    var dataList = [];
    var colors = this.data.colors;
    var colorIndex = 0;
    for (var key in sumByType) {
      // 判断对象 sumByType 是否具有名为 key 的属性
      if (sumByType.hasOwnProperty(key)) {
        var typeid = parseInt(key); // 将 typeid 转换为整数
        var title = sumByType[key].title; // 获取消费类型名
        var value = sumByType[key].amount; // 获取消费类型总金额
        // 将数据添加到 dataList 中
        dataList.push({
          typeid: typeid,
          title: title, // 将消费类型名作为标题
          value: value, // 将消费总金额作为值
          background: colors[colorIndex] // 使用预定义的颜色
        });
        colorIndex = (colorIndex + 1) % colors.length; // 超出后取余
      }
    }
    console.log('将sumbytype转换后存入dataList', dataList)
    this.setData({
      dataList: dataList
    });
    // 绘制饼状图
    this.measureCanvas();
  },

  // 量画布的尺寸
  measureCanvas: function () {
    // 使用选择器查询获取画布信息
    let query = wx.createSelectorQuery().in(this);
    // 选择饼图画布节点并获取其位置信息
    query.select('#pieCanvas').boundingClientRect();
    // 执行查询并在回调中处理结果
    var that = this;
    query.exec((res) => {
      // 将画布的宽度和高度存储到页面数据中
      var canvasInfo = {};
      canvasInfo.width = res[0].width;
      canvasInfo.height = res[0].height * 2; // 乘以2为了高分辨率屏幕
      that.setData({
        canvasInfo: canvasInfo
      });
      // 绘制饼图，-1代表不选中任何区域
      that.drawPie(-1);
    });
  },

  // 当用户触摸画布时
  touchStart(e) {
    var pieInfo = this.data.pieInfo;
    var x = e.touches[0].x;
    var y = e.touches[0].y;
    if ((Math.pow(x - pieInfo.centerX, 2) + Math.pow(y - pieInfo.centerY, 2)) > Math.pow(pieInfo.pieRadius, 2)) { // 在圆外，不执行
      return;
    }
    // 在圆内，根据触摸点的位置计算点击的区域
    var pointPos = 0;
    var angle = Math.atan((y - pieInfo.centerY) / (x - pieInfo.centerX)) / (Math.PI / 180);
    //判断角度值
    if (x > pieInfo.centerX) {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI;
      } else {
        pointPos = angle / 180 * Math.PI + 2 * Math.PI;
      }
    } else {
      if (angle > 0) {
        pointPos = angle / 180 * Math.PI + Math.PI;
      } else {
        pointPos = angle / 180 * Math.PI + Math.PI;
      }
    }
    var index = 0;
    // 根据点击的位置确定所在区域的索引
    for (var i = 0; i < pieInfo.area.length; i++) {
      if (pointPos > pieInfo.area[i].start && pointPos < pieInfo.area[i].end) {
        index = i;
      }
    }

    // 更新 lastClickedIndex
    var lastClickedIndex = this.data.lastClickedIndex;
    if (lastClickedIndex == index) {
      lastClickedIndex = -1;
    } else {
      lastClickedIndex = index;
    }
    this.setData({
      lastClickedIndex: lastClickedIndex
    });
    // 绘制点击后的饼图
    this.drawPie(index);
  },

  // 绘制饼图和标注
  drawPie(index) {
    // 创建画布上下文
    const ctxPie = wx.createCanvasContext("pieCanvas");
    var canvasInfo = this.data.canvasInfo;
    var dataList = this.data.dataList;
    var pieInfo = this.data.pieInfo;
    var typelist = app.globalData.typelist;
    var lastClickedIndex = this.data.lastClickedIndex;
    // 计算饼图半径
    var pieRadius = (canvasInfo.width - 90) / 2.5;
    pieInfo.pieRadius = pieRadius;
    // 计算饼图中心坐标
    var pieX = 72 + pieRadius;
    pieInfo.centerX = pieX;
    var pieY = 15 + pieRadius;
    pieInfo.centerY = pieY;
    // 计算总数值
    var totalValue = 0;
    for (var i = 0; i < dataList.length; i++) {
      totalValue = totalValue + dataList[i].value;
    }
    // 存储每个扇形的起始角度和结束角度
    var area = [];
    // 遍历绘制每个扇形
    for (var i = 0; i < dataList.length; i++) {
      var areaItem = {};
      ctxPie.beginPath();
      var start = 0;
      for (var j = 0; j < i; j++) {
        start += dataList[j].value;
      }
      var end = start + dataList[i].value;
      // 根据 lastClickedIndex 的值来确定是否需要放大绘制的扇形
      var enlargedRadius = lastClickedIndex === i ? pieRadius + 10 : pieRadius;
      ctxPie.arc(pieX, pieY, enlargedRadius, start / totalValue * 2 * Math.PI, end / totalValue * 2 * Math.PI);
      areaItem.start = start / totalValue * 2 * Math.PI;
      areaItem.end = end / totalValue * 2 * Math.PI;
      area.push(areaItem);
      ctxPie.lineTo(pieX, pieY);
      ctxPie.fillStyle = dataList[i].background;
      ctxPie.fill();
      ctxPie.closePath();
    }

    // 绘制标注
    for (var i = 0; i < dataList.length; i++) {
      var startX = pieRadius - 15;
      var startY = pieY + pieRadius + 20 + i * 30 + 15; // 20 是标注和饼图之间的间距
      if (lastClickedIndex === i) {
        startX += 5; // 标注放大时，向右移动一点
        startY += 5; // 标注放大时，向下移动一点
      }
      ctxPie.fillStyle = dataList[i].background; // 填充标注左边小方块的颜色
      ctxPie.fillRect(startX, startY, 20, 20);

      // 查找对应的消费类型标题
      var title = '';
      for (var j = 0; j < typelist.length; j++) {
        if (typelist[j].typeid == dataList[i].typeid) {
          title = dataList[i].title;
          break;
        }
      }

      ctxPie.fillStyle = '#8a8a8a'; // 标注字体颜色
      ctxPie.font = '17rpx sans-serif'; // 标注字体
      ctxPie.fillText(title, startX + 30, startY + 15); // 标题
      ctxPie.fillText(dataList[i].value + "元", startX + 80, startY + 15); // 数值
      ctxPie.fillText(parseInt(dataList[i].value * 100 / totalValue) + "%" + "", startX + 140, startY + 15); // 百分比
    }

    // 存储每个扇形的角度信息
    pieInfo.area = area;
    this.data.pieInfo = pieInfo;
    // 绘制画布
    ctxPie.draw();
  }

});
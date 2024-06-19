// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { userName } = event;
  const db = cloud.database();

  try {
    // 删除数据库cashflow中对应用户的数据
    await db.collection('cashflow').where({
      userName: userName
    }).remove();

    // 删除typelist中对应用户的数据
    await db.collection('typelist').where({
      userName: userName
    }).remove();

    // 删除数据库userinfo中的用户信息
    // await db.collection('userinfo').doc(userName).remove();
    await db.collection('userinfo').where({
      userName: userName
    }).remove();

    // 清除本地缓存的userInfo，cashflow，typelist
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('cashflow');
    wx.removeStorageSync('typelist');

    return {
      success: true,
      message: "注销成功"
    };
  } catch (err) {
    return {
      success: false,
      message: "注销失败" 
    };
  }
}

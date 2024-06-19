// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const userName = event.userName; // 从事件参数中获取 userName
  try {
    const res = await db.collection('cashflow').where({
      userName: userName
    }).get();
    const data = res.data; // 获取查询结果中的数据
    return data; // 将数据返回给调用方
  } catch (err) {
    console.error('查询数据库失败', err);
    throw err;
  }
}

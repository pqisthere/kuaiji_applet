// // 云函数入口文件
// const cloud = require('wx-server-sdk');

// cloud.init({
//   env: cloud.DYNAMIC_CURRENT_ENV
// })

// // 云函数入口函数
// exports.main = async (event, context) => {
//   const db = cloud.database()
//   const userName = event.userName; // 从事件参数中获取 userName
//   try {
//     // 根据 userName 查询用户信息
//     const res = await db.collection('userinfo').doc(userName).get();
//     const userInfo = res.data; // 获取用户信息
//     return userInfo; // 将用户信息返回给调用方
//   } catch (err) {
//     console.error('查询数据库失败', err);
//     throw err;
//   }
// }

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
    // 根据 userName 查询用户信息
    const res = await db.collection('userinfo').where({
      userName: userName
    }).get();
    const userInfo = res.data; // 获取用户信息
    return userInfo; // 将用户信息返回给调用方
  } catch (err) {
    console.error('查询数据库失败', err);
    throw err;
  }
}

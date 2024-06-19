// 云函数 login 的入口文件 index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { userName, passWord } = event
  try {
    const res = await db.collection('userinfo')
      .where({
        userName: userName,
        passWord: passWord
      })
      .get()
    if (res.data.length > 0) {
      return {
        success: true,
        message: '登录成功',
        userInfo: res.data[0] // 返回查询到的用户信息
      }
    } else {
      return {
        success: false,
        message: '用户名或密码错误，或未注册'
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '查询数据库失败',
      error: error
    }
  }
}

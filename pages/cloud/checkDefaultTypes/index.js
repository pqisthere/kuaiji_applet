// 云函数 checkDefaultTypes 的入口文件 index.js
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

exports.main = async (event, context) => {
  const { userName } = event
  try {
    const res = await db.collection('typelist')
      .where({
        userName: userName
      })
      .get()
    if (res.data.length === 0) {
      return {
        success: true,
        message: 'typelist 集合为空，添加默认消费类型',
        data: [] // 返回空数组表示 typelist 为空
      }
    } else {
      return {
        success: true,
        message: 'typelist 集合不为空，返回数据库中的 typelist',
        data: res.data // 返回查询到的 typelist 数据
      }
    }
  } catch (error) {
    return {
      success: false,
      message: '查询 typelist 集合失败',
      error: error
    }
  }
}

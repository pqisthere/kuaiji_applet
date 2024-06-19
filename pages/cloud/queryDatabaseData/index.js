// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const db = cloud.database();

// 查询数据库中的数据
exports.main = async (event, context) => {
  try {
    const { data } = await db.collection('cashflow').get();
    return data; // 返回查询到的数据
  } catch (error) {
    throw error;
  }
};
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  try {
    // 从参数中获取要删除的账本名称
    const title = event.title;

    // 指定要操作的集合
    const collection = db.collection('cashflow');

    // 删除符合条件的数据
    const res = await collection.where({
      title: title
    }).remove();

    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const userName = event.userName; // 从事件参数中获取 userName
  const rawlist = event.rawlist;
  const budget = event.budget; 
  try {
    for (let i = 0; i < rawlist.length; i++) {
      const item = rawlist[i];
      // 检查消费记录的 userName 是否与事件参数中的 userName 相符
      if (item.userName == userName) {
        // 如果相符，则将消费记录对象存储到数据库中，文档 ID = 账单名 title
        const result = await db.collection('cashflow').doc(item.title).set({
          data: {
            title: item.title,
            userName: userName,
            items: item.items || '',
            budget: item.budget
          }
        })
      }
    }
    return {
      success: true
    };
  } catch (err) {
    throw err
  }
}

// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const deltypeid = event.deltypeid;
  const userName = event.userName;

  try {
    // 删除 cashflow 数据库中与 deltypeid 对应的消费记录条目
    await db.collection('cashflow').where({
      'items.typeid': deltypeid,
      userName: userName
    }).update({
      data: {
        items: {
          typeid: deltypeid
        }
      }
    });
    return {
      success: true,
      message: '删除成功'
    };
  } catch (err) {
    console.error('删除失败：', err);
    return {
      success: false,
      message: '删除失败，请重试'
    };
  }
};

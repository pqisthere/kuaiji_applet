// // 云函数 updateUserInfo
// const cloud = require('wx-server-sdk');

// cloud.init();

// const db = cloud.database();

// exports.main = async (event, context) => {
//   const {
//     userName,
//     newNickname,
//     newAvatar
//   } = event;

//   try {
//     const updateData = {}; // 要更新的数据对象

//     if (newNickname) {
//       updateData.nickName = newNickname; // 如果有新昵称，更新用户昵称到 nickName 字段
//     }

//     if (newAvatar) {
//       updateData.avatarUrl = newAvatar; // 更新用户头像URL
//     }

//     // 更新用户信息到云数据库中的 userinfo 集合
//     const result = await db.collection('userinfo').doc(userName).update({
//       data: updateData
//     });
//     return result;
//   } catch (err) {
//     console.error('更新用户信息失败', err);
//     throw err;
//   }
// };

// 云函数 updateUserInfo
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const {
    userName,
    newNickname,
    newAvatar
  } = event;

  try {
    const updateData = {}; // 要更新的数据对象

    if (newNickname) {
      updateData.nickName = newNickname; // 如果有新昵称，更新用户昵称到 nickName 字段
    }

    if (newAvatar) {
      updateData.avatarUrl = newAvatar; // 更新用户头像URL
    }

    // 根据 userName 更新用户信息到云数据库中的 userinfo 集合
    const result = await db.collection('userinfo').where({
      userName: userName
    }).update({
      data: updateData
    });
    return result;
  } catch (err) {
    console.error('更新用户信息失败', err);
    throw err;
  }
};

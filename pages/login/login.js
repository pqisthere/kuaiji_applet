const app = getApp();
const db = wx.cloud.database();

Page({
  // 初始数据
  data: {
    userInfo: {
      userName: '',
      passWord: '',
      nickName: '',
      avatarUrl: 'https://env-00jxgn6qwwy9.normal.cloudstatic.cn/imag/avatar.png',
    },
    disableButton: false, // 默认登陆注册按钮可用，其他三个红色按钮不显示
    passwordVisible: false, // 默认密码不可见
    modalHidden: true, // 隐藏修改密码模态框
    originalPassword: '', // 原密码
    newPassword: '', // 新密码
  },

  // 页面显示时调用
  onShow() {
    console.log('我是login页')
    // 检查本地存储是否有用户信息
    var userInfo = wx.getStorageSync('userInfo');
    console.log('本地userInfo：', userInfo)
    var userName = userInfo.userName;
    // 赋值给全局userName
    app.globalData.loggedInUserName = userName;
    console.log('全局userName：', app.globalData.loggedInUserName)
    if (userInfo) {
      this.setData({
        'userInfo': userInfo,
        'disableButton': true
      });
    }
  },

  // ----
  // 切换小眼睛和密码的显示状态
  togglePasswordVisibility() {
    this.setData({
      passwordVisible: !this.data.passwordVisible
    });
  },

  // ----
  // 输入用户名
  inputUserName(e) {
    // 解构赋值：从对象 e.detail 中提取属性 value 的值，并将其赋给变量 value
    const {
      value
    } = e.detail;
    console.log('输入的userName：', value);
    this.setData({
      'userInfo.userName': value
    });
  },

  // 输入密码
  inputPassWord(e) {
    const {
      value
    } = e.detail;
    console.log('输入的密码：', value);
    // 密码验证的正则表达式
    // 至少包含一个数字和一个英文字母，长度为6到8个字符
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,8}$/;
    if (passwordRegex.test(value)) {
      this.setData({
        'userInfo.passWord': value
      });
    } else {
      wx.showToast({
        title: '密码需至少包含一个数字和一个字母，且长度为6到8个字符',
        icon: 'none'
      });
    }
  },

  // ----
  // 登录
  login() {
    // 解构赋值从页面中的数据对象  this.data.userInfo 提取 userName 和 passWord 两个属性的值
    const {
      userName,
      passWord
    } = this.data.userInfo;
    // 输入了用户名和正确的密码格式
    if (userName && passWord) {
      // 调用login云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {
          userName: userName,
          passWord: passWord
        },
        // login云函数调用成功
        success: (res) => {
          if (res.result.success) {
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
            // 保存用户信息到本地存储
            wx.setStorageSync('userInfo', res.result.userInfo);
            console.log('本地userInfo', res.result.userInfo);
            // 保存用户名（账号）到全局
            app.globalData.loggedInUserName = res.result.userInfo.userName;
            console.log('全局userName', app.globalData.loggedInUserName)
            // 登录成功后延迟0.6s后跳转到首页
            setTimeout(() => {
              // wx.navigateTo({
              //   url: '/pages/index/index'
              // });
            }, 6000);
            // 更新页面数据，禁用按钮
            this.setData({
              'disableButton': true,
            });
          } else {
            wx.showToast({
              title: res.result.message,
              icon: 'none'
            });
          }
        },
        // login云函数调用失败
        fail: (error) => {
          console.error('调用login云函数失败', error);
          wx.showToast({
            title: '调用login云函数失败',
            icon: 'none'
          });
        }
      });
    } else if (!userName && !passWord) {
      wx.showToast({
        title: '用户名和密码都未输入，或密码格式错误',
        icon: 'none'
      });
    } else if (!userName) {
      wx.showToast({
        title: '用户名未输入',
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '密码未输入或格式错误',
        icon: 'none'
      });
    }
  },

  // 注册
  register() {
    const {
      userName,
      passWord
    } = this.data.userInfo;

    // 输入了用户名和正确的密码格式
    if (userName && passWord) {
      // 在数据库中查询是否已存在该用户名
      db.collection('userinfo').where({
        userName: userName
      }).get({
        success: (res) => {
          if (res.data.length === 0) {
            // 不存在该用户名，可以注册
            db.collection('userinfo').add({
              data: {
                _id: userName,
                userName: userName,
                passWord: passWord
              },
              success: (res) => {
                wx.showToast({
                  title: '注册成功',
                  icon: 'success'
                });
                // 保存用户信息到本地存储
                wx.setStorageSync('userInfo', this.data.userInfo);
                console.log('本地userInfo', this.data.userInfo);
                // 保存用户名（账号）到全局
                app.globalData.loggedInUserName = this.data.userInfo.userName;
                console.log('全局userName', app.globalData.loggedInUserName)
                // 注册成功后延迟0.6s后跳转到首页
                setTimeout(() => {
                  wx.navigateTo({
                    url: '/pages/index/index'
                  });
                }, 600);
                // 更新页面数据，禁用按钮
                this.setData({
                  'disableButton': true,
                });
              },
              fail: (error) => {
                console.error('注册失败', error);
                wx.showToast({
                  title: '注册失败',
                  icon: 'none'
                });
              }
            });
          } else {
            // 用户名已存在，不可注册
            wx.showToast({
              title: '用户名已存在',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          console.error('查询数据库失败', error);
          wx.showToast({
            title: '查询数据库失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '用户名或密码错误',
        icon: 'none'
      });
    }
  },
  

  // 注销
  unregister() {
    const userName = this.data.userInfo.userName;
    console.log('要注销的userInfo：', this.data.userInfo);
    var cashflow = wx.getStorageSync('cashflow');
    console.log('要注销的cashflow:', cashflow);
    var typelist = app.globalData.typelist;
    console.log('要注销的typelist:', typelist);

    // 该用户存在
    if (userName) {
      wx.showModal({
        title: '手下留情！',
        content: '注销后将清除所有数据，且无法恢复，确定要注销吗？',
        success: (res) => {
          if (res.confirm) { // 用户点击确认按钮
            // 删除userinfo，cashflow，typelist数据库对应用户的数据
            wx.cloud.callFunction({
              name: 'unRegister',
              data: {
                userName: userName
              },
              success: res => {
                console.log('已注销所有数据库对应用户的数据');
                if (res.result.success) {
                  // 注销成功的处理逻辑
                  wx.showToast({
                    title: '注销成功',
                    icon: 'success'
                  });
                } else {
                  // 注销失败的处理逻辑
                  wx.showToast({
                    title: '注销失败',
                    icon: 'none'
                  });
                }
              },
              fail: err => {
                console.error(err);
                wx.showToast({
                  title: '调用unRegister云函数失败',
                  icon: 'none'
                });
              }
            })

            // 清除本地缓存的userInfo，cashflow，typelist
            wx.removeStorageSync('userInfo');
            wx.removeStorageSync('cashflow');
            wx.removeStorageSync('typelist');
            // 更新页面数据，显示默认昵称
            this.setData({
              'userInfo.userName': '',
              'userInfo.passWord': '',
              'disableButton': false,
            });
            // 检查注销后的本地缓存
            var userInfo = wx.getStorageSync('userInfo');
            console.log('注销后的本地userInfo:', userInfo);
            // 检查注销后的现金流
            var cashflow = wx.getStorageSync('cashflow');
            console.log('注销后的本地cashflow:', cashflow);
            // 检查注销后的消费类型
            var typelist = wx.getStorageSync('typelist');
            console.log('注销后的本地typelist:', typelist);
          }
        }
      });
    } else { // 该用户不存在
      wx.showToast({
        title: '用户名错误',
        icon: 'none'
      });
    }
  },

  // ----
  // 修改密码模态框-显示
  changePasswordModal: function (e) {
    this.setData({
      modalHidden: !this.data.modalHidden, // 显示模态框
    })
  },

  // 处理新密码输入
  handleBlur(e) {
    this.setData({
      newPassword: e.detail.value,
    });
  },

  // 修改密码模态框-确认
  changePasswordModalConfirm(e) {
    const newPassword = this.data.newPassword;
    console.log('修改的新密码：', newPassword);
    // 密码验证的正则表达式
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9]{6,8}$/;
    if (passwordRegex.test(newPassword)) {
      // 密码格式正确则修改数据库中的密码
      this.updateDataBasePassword(newPassword);
      // 关闭模态框，清空输入框
      this.setData({
        modalHidden2: !this.data.modalHidden2,
        newPassword: '', // 清空输入框
      });
    } else {
      wx.showToast({
        title: '密码需至少包含一个数字和一个字母，且长度为6到8个字符',
        icon: 'none'
      });
    }
  },

  // 修改密码模态框-取消
  changePasswordModalCancel() {
    this.setData({
      modalHidden: !this.data.modalHidden,
    })
  },

  // 更新数据库中的密码
  updateDataBasePassword() {
    // 解构得到newPassword
    const {
      newPassword
    } = this.data;
    const userName = app.globalData.loggedInUserName;
    console.log('userName', userName);
    console.log('新密码：', newPassword);
    // 用户名和密码都存在
    if (userName && newPassword) {
      // 修改userinfo数据库中的用户密码
      db.collection('userinfo').where({
        userName: userName
      }).update({
        data: {
          passWord: newPassword
        },
        success: (res) => {
          wx.showToast({
            title: '密码修改成功',
            icon: 'success'
          });
          // 关闭模态窗
          this.setData({
            modalHidden: true
          });
          // 跳转到首页
          wx.navigateTo({
            url: '/pages/index/index'
          });
        },
        fail: (error) => {
          console.error('修改密码失败', error);
          wx.showToast({
            title: '修改密码失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '用户名或密码错误',
        icon: 'none'
      });
    }
  },

  // ----
  // 退出登录
  logout() {
    // 清除本地缓存的用户信息
    wx.removeStorageSync('userInfo');
    // 更新页面数据，显示默认昵称
    this.setData({
      'userInfo.userName': '',
      'userInfo.passWord': '',
      'disableButton': false,
    });
  }
});
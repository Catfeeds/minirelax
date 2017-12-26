// pages/user/user.js
var app = getApp()
Page({
  data: {
    userType:1,
    info: {},
    // 用户信息
    userInfo: {
      avatarUrl: "",
      nickName: "未登录"
    },
    bType: "primary", // 按钮类型
    actionText: "退出登录", // 按钮文字提示
    lock: false ,//登录按钮状态，false表示未登录
    loadingText: '加载中...',
    loadingHidden: false,
    textareaHidden:true,
    textareaVlaue:""
  
  },

  onLoad: function () {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        loadingHidden: true
      })
    });
  },

  //保存会员个性签名
  bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
    var that = this;
    var content = e.detail.value.textarea;
    that.setData({
      username: e.detail.value.textarea,
      textareaHidden: true
    });

    wx.request({
      url: app.api.hostUrl + '/Api/User/user_edit',
      method: 'post',
      data: {
        content: content,
        uid: app.api.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status==1) {
          wx.showToast({
            title: '保存成功！',
            duration: 2000
          });
          var info = that.data.info;
          info.intro = content;
          that.setData({
            textareaHidden: true,
            info: info
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });

  },

  userText:function(e) {
    var that = this;
    console.log(this.data.username)
    that.setData({
      textareaHidden: false,
      textareaVlaue: this.data.username
    })
  },

  //取消
  cancel:function(e){
    console.log(e)
    this.setData({
      textareaHidden: true, 
      // username: this.username
    })
  },

  onShow: function () {
    this.loadUserData();
  },

  //获取用户信息
  loadUserData: function(e) {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    var that = this;
    that.setData({
      userType: app.api.userType
    });
    //获取用户学习时长和 心得总数
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/User/getdata',
      method: 'post',
      data: {
        uid: app.api.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {    
          var info = res.data.info;
          that.setData({
            info: info
          });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  onReady: function (){
    //页面渲染完成
  },
})
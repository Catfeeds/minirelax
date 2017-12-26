// pages/user/user.js
var app = getApp()
Page({
  data: {
    info: {},
    userId: 0,
  },

  onLoad: function (options) {
    var that = this;
    var userId = options.userId;
    that.setData({
      userId: userId,
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
    //获取用户信息
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/User/userinfo',
      method: 'post',
      data: {
        uid: that.data.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) { 
        var status = res.data.status;
        if(status==1){
          var info = res.data.userinfo;
          that.setData({
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

  onReady: function (){
    //页面渲染完成
    wx.hideToast();
  },
})
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openstate: 0,
    otype: 0,
  },

  radioChange: function (e) {
    this.setData({
      otype: e.detail.value,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //获取 支付按钮开启状态
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/User/getstate',
      method: 'post',
      data: {
        uid: app.api.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var openstate = res.data.openstate;
        that.setData({
          openstate: openstate
        });
      }
    });
  },

  //下单支付
  buynow: function (e) {
    var that = this;
    var otype = that.data.otype;
    if (otype <= 0) {
      wx.showToast({
        title: '请先选择开通类型！',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.api.hostUrl + '/Api/Wxpay/wxpay',
      data: {
        otype: otype,
        uid: app.api.userId,
      },
      method: 'POST', // OPTIONS, GET, POST, PUT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data.status == 1) {
          var order = res.data.arr;
          wx.requestPayment({
            timeStamp: order.timeStamp,
            nonceStr: order.nonceStr,
            package: order.package,
            signType: 'MD5',
            paySign: order.paySign,
            success: function (res) {
              that.setData({
                showModalStatus: false
              });
              if (otype >= 3) {
                app.api.userType = otype;
                wx.showModal({
                  title: '支付成功',
                  content: '请添加管家微信小橙 chs_177',
                  success: function (res) {
                    if (res.confirm) {

                    }
                  }
                })
              } else {
                app.api.userType = 2;
                that.setData({
                  nullHouse: true, //弹窗显示
                })
                wx.showToast({
                  title: "支付成功!",
                  duration: 2000,
                });
              }

            },
            fail: function (res) {
              wx.showToast({
                title: res,
                duration: 3000
              })
            }
          })
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！err:buynow',
          duration: 2000
        });
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})
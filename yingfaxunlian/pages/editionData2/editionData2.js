//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    list: [],
    info: {},
    catId: 0,
    currentName: '',
    currentId: 0,
    page: 2,
    widths: 150,
    nullHouse: true,
    checked: false,
    checked1: true,
    userType:1,
    showModal: false,
    nullHouseSS:true,
    otype: 0,
  }, 
  radioChange: function (e) {
    this.setData({
      otype: e.detail.value,
    });
  },
  aa: function () {

    this.setData({
      nullHouseSS: true, //弹窗显示
    })
  },

  // 弹窗
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  powerDrawers: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },

  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 100, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false,
            showModalStatuss: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == 'open') {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    // 显示2 
    if (currentStatu == 'opens') {
      this.setData(
        {
          showModalStatuss: true
        }
      );
    }

  },

  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
    
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },

  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    this.hideModal();
    this.setData({
      nullHouse: false, //弹窗显示
    })
  },

  //事件处理函数
  bindViewTap: function (e) {
    console.log(e)
    // 取出id值
    var that = this;
    // 取得下标
    var index = parseInt(e.currentTarget.dataset.index);
    // 取出id值
    // var objectId = that.data.shiping[index].get('java');
    console.log(that.data.shiping[index].java)
    var objectId = that.data.shiping[index].java

    that.setData({
      mingzi: objectId
    })
    wx.navigateTo({
      url: '../music/music?objectId=' + objectId
    })
  },

  //音频点击事件
  bindViewTa: function (e) {
    var that = this;
    var isfree = e.currentTarget.dataset.isfree;
    var utype = that.data.userType;
    var ctype = e.currentTarget.dataset.ctype;
    //会员
    if (isfree > 1 && utype <= 1 ) {
      this.setData({
        showModal: true,
        nullHouseSS: false
      });
      return false;
    }
    // 取出id值
    var index = parseInt(e.currentTarget.dataset.id);
    var title = e.currentTarget.dataset.name;
    // if (ctype==3) {
    //   wx.navigateTo({
    //     url: '../book/book?objectId=' + index + '&title=' + title
    //   });
    // } else {
    //   wx.navigateTo({
    //     url: '../music/music?objectId=' + index + '&title=' + title
    //   });
    // }
    wx.navigateTo({
      url: '../music/music?objectId=' + index + '&title=' + title + '&ctype=' + ctype,
    });
  },

  onLoad: function (options) {
    var that = this;
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    that.setData({
      currentName: currentName,
      currentId: currentId,
    });

    var title = options.title;
    var catId = options.catId;
    that.setData({
      catId: catId,
      userType: app.api.userType,
    });
    wx.setNavigationBarTitle({
      title: title,
    });
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    var that = this;
    var catId = that.data.catId;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getcatmore',
      method: 'post',
      data: {
        cat_id: catId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        that.setData({
          list: list,
          mingzi: res.data.catname,
          page: 2,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },

  //当前播放点击事件
  bindCurrent: function (e) {
    var index = parseInt(e.currentTarget.dataset.id);
    var title = this.data.currentName;
    wx.navigateTo({
      url: '../music/music?objectId=' + index + '&title=' + title
    })
  },

  onReady: function () {
    //页面渲染完成
    var that = this;
    var num = 0;
    var a = 1;
    var i = setInterval(function jk() {
      num = num + a;
      if (that.data.widths == num) {
        num = 0;
        clearInterval(i);
        that.setData({
          num: num
        })

        if (num == 0) {
          setTimeout(function () {
            i = setInterval(jk, 100)
          }, 1000)
        }

      } else {
        that.setData({
          num: num
        })
      }
    }, 100)
  },

  scll: function (e) {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        var ah = e.detail.scrollWidth - res.windowWidth;
        that.setData({
          ah: ah
        })
      }
    })
  },

  gd: function () {
    var that = this;
    var catId = that.data.catId;
    var page = that.data.page;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getcatmore',
      method: 'post',
      data: {
        cat_id: catId,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        if (list == '') {
          wx.showToast({
            title: '没有找到更多数据.',
            duration: 2000
          });
          return false;
        }
        that.setData({
          list: that.data.list.concat(list),
          page: parseInt(page) + 1,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
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

  onShareAppMessage: function () {
    return {
      title: '原版阅读',
      path: '/pages/index/index',
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
})

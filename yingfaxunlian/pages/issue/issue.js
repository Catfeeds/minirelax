//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    list: [],
    page: 2,
    notice: {},
    style: "style",
    yangshi: "",
    qtype: 1,
    modalHidden: true,
    nullHouse: true,
    nums: 0,
    userType: 1,
    otype:0,
  },
  radioChange:function (e) {
    this.setData({
      otype: e.detail.value,
    });
  },
  modalBindaconfirm: function () {
    this.setData({
      modalHidden: !this.data.modalHidden,
      nullHouse: !this.data.nullHouse
    })
  },
  modalBindcancel: function () {
    this.setData({
      modalHidden: !this.data.modalHidden
    })
  }, 
  aa: function () {

    this.setData({
      nullHouse: true, //弹窗显示
    })
  },
  //英语区
  yingyu: function (e) {
    this.setData({
      style: "style",
      yangshi: "",
      qtype: 1,
      page: 2,
    });
    this.loadquestion();
  },

  //法语区
  fayu: function (e) {
    console.log(e)
    this.setData({
      style: "",
      yangshi: "style",
      qtype: 2,
      page: 2,
    });
    this.loadquestion();
  },

  //加载问题
  loadquestion: function () {
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getquestion',
      method: 'post',
      data: {
        qtype: that.data.qtype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        if (list == '') {
          wx.showToast({
            title: '没有找到更多数据！',
            duration: 2000
          });
        }
        that.setData({
          list: list,
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

  // 点击显示隐藏
  shuxing: function (e) {
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      shuxing: i,
      png: 1,
      id: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        shuxing: i,
        png: 0,
        id: 0,
      })
    }
  },
  mian: function (e) {
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      shuxings: i,
      pngs: 1,
      ids: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        shuxings: i,
        pngs: 0,
        ids: 0,
      })
    }
  },

  pinglun: function (e) {
    var qid = e.currentTarget.dataset.qid;
    wx.navigateTo({
      url: '../comment/comment?qid=' + qid,
    })
  },
  //提交事件
  evaSubmit: function (e) {
    var that = this;
    var content = e.detail.value.evaContent;
    if (!content) {
      wx.showToast({
        title: '请输入你要发布的问题！',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.api.hostUrl + '/Api/User/savequestion',
      method: 'post',
      data: {
        uid: app.api.userId,
        qtype: that.data.qtype,
        content: content,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          wx.showToast({
            title: '发布成功！',
            duration: 2000
          });
          that.util('close');
          setTimeout(function (e) {
            that.onShow();
          }, 2300);

        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
    });
  },

  // 弹窗
  powerDrawer: function (e) {
    var nums = this.data.nums;
    var userType = this.data.userType;
    if (nums >= 20 && userType<=1) {
      this.setData({
        modalHidden: !this.data.modalHidden,
      });
      return false;
    }
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

  //头像点击事件
  userinfo: function (e) {
    var userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '../userinfo/userinfo?userId=' + userId,
    });
  },

  //课程点击事件
  pro: function (e) {
    var proId = parseInt(e.currentTarget.dataset.proid);
    var title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../music/music?objectId=' + proId + '&title=' + title
    })
  },

  onLoad: function () {
    var that = this;
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    });
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getquestion',
      method: 'post',
      data: {
        uid: app.api.userId,
        qtype: that.data.qtype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res)
        var list = res.data.list;
        var notice = res.data.notice;
        var content = notice.concent;
        WxParse.wxParse('content', 'html', content, that, 8);
        if (list == '') {
          wx.showToast({
            title: '没有找到提问记录！',
            duration: 2000
          });
        }
        that.setData({
          list: list,
          page: 2,
          notice: notice,
          nums: res.data.nums,
          userType: app.api.userType,
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

  //查看更多问题
  getMoreque: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    });
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getlist',
      method: 'post',
      data: {
        page: page,
        qtype: that.data.qtype,
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

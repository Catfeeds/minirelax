import Util from '../../utils/imgsize';  
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
     imageWidth: 0,
     imageHeight:0,
    userType:1,
    slideshow: false,
    selectedId: '',
    width:0,
    height:0,
    currentName: '',
    currentId: 0,
    is_qx:0,
    nullHouse: true,  //先设置隐藏
    showModalStatus: false,
    hidden:true,
    noteId: 0,
    sinfo: {},
    list: [],
    fixed:true
  },
  hiddens(e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
    this.setData({
      nullHouse:true
    })
  },
  // 弹窗
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
    this.setData({
      fixed:!this.data.fixed
    })
  },


  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
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
            showModalStatus: false
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

  },
  //checked 点击事件
  choice:function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '是否确认CHECKED ？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/checked',
          method: 'post',
          data: {
            id: id,
            uid: app.api.userId,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //--init data
            var status = res.data.status;
            if (status == 1) {
              wx.showToast({
                title: '操作成功！',
                duration: 2000
              });
              setTimeout(function(){
                that.loadData();
              },2300);
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
              title: '网络异常！',
              duration: 2000
            });
          }
        });

      }
    });
  },

  imageLoad: function (e) {
     console.log(e)
     //获取图片的原始宽度和高度  
     let originalWidth = e.detail.width;
     let originalHeight = e.detail.height;
     let imageSize = Util.imageZoomHeightUtil(originalWidth,originalHeight-130);  

   //   let imageSize = Util.imageZoomHeightUtil(originalWidth,originalHeight,);  
   //   let imageSize = Util.imageZoomWidthUtil(originalWidth, originalHeight, 145);

     this.setData({ 
        imageWidth: imageSize.imageWidth,                   imageHeight: imageSize.imageHeight
         });
  },
  // 打开轮播遮罩层
  show: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    that.setData({
      slideshow: true,
      selectedId: id,
      width: e.target.dataset.width,
      height: e.target.dataset.height,
    })
  },

  // 关闭遮罩层
  hide: function () {
    this.setData({
      slideshow: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    this.setData({
      currentName: currentName,
      currentId: currentId,
      noteId: options.noteId,
      uid: app.api.userId,
    });
  },

  onShow: function () {
    this.loadData();
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    this.setData({
      currentName: currentName,
      currentId: currentId,
    });
  },

  //加载所有会员分享
  loadData: function(){
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    });
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/user/study_detail',
      method: 'post',
      data: {
        uid: app.api.userId,
        sid: that.data.noteId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status==1) {
          var info = res.data.info;
          var list = res.data.list;
          that.setData({
            sinfo: info,
            list: list,
            is_qx: res.data.is_qx,
            is_gl: res.data.is_gl,
          });
        } else {
          wx.showToast({
            title: '数据异常！',
            duration: 2000
          });
        }
        wx.hideToast();
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:loadData',
          duration: 2000
        });
        wx.hideToast();
      },
    })
  },

  //提交事件
  evaSubmit: function (e) {
    var that = this;
    var is_qx = that.data.is_qx;
    if (is_qx != 1) {
      wx.showToast({
        title: '对不起，您没有回答问题的权限！',
        duration: 2000
      });
      return false;
    }

    var content = e.detail.value.evaContent;
    if (!content) {
      wx.showToast({
        title: '请输入您要点评的内容！',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.api.hostUrl + '/Api/User/savestudyans',
      method: 'post',
      data: {
        uid: app.api.userId,
        content: content,
        sid: that.data.noteId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          wx.showToast({
            title: '提交成功！',
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

  //VIP课程点击事件
  classname: function () {
    var that = this;
    var userType = app.api.userType;
    if (userType <= 1) {
      wx.showModal({
        title: '提示',
        content: '成为VIP会员即可加入课程！',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              nullHouse: false, //弹窗显示
              hidden: !that.data.hidden
            })
          }
        }
      })
    }
  },

  dianji:function(e) {
     var that = this;
    if (e.target.id == "0") {
      that.setData({
        hidden: true
      })
    }
  },

  //当前播放点击事件
  bindCurrent: function (e){
    var index = parseInt(e.currentTarget.dataset.id);
    var title = this.data.currentName;
    wx.navigateTo({
      url: '../music/music?objectId=' + index + '&title=' + title
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //课程点击事件
  pro: function (e) {
    var proId = parseInt(e.currentTarget.dataset.proid);
    var title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../music/music?objectId=' + proId + '&title=' + title
    })
  },

  //头像点击事件
  userinfo: function (e) {
    var userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '../userinfo/userinfo?userId=' + userId,
    });
  },

  //会员删除笔记
  delstudy: function (e) {
    var that = this;
    var sid = e.currentTarget.dataset.sid;
    wx.showModal({
      title: '提示',
      content: '您确定要删除吗？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/delstudy',
          method: 'post',
          data: {
            sid: sid,
            uid: app.api.userId,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //--init data
            var status = res.data.status;
            if (status == 1) {
              wx.showToast({
                title: '操作成功！',
                duration: 2000
              });
              setTimeout(function(){
                wx.navigateBack();
              },2300);
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
              title: '网络异常！',
              duration: 2000
            });
          }
        });
      }
    });
  },

  //会员删除笔记
  delstudyans: function (e) {
    var that = this;
    var ansid = e.currentTarget.dataset.ansid;
    wx.showModal({
      title: '提示',
      content: '是否确定删除？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/delstudyans',
          method: 'post',
          data: {
            ansid: ansid,
            uid: app.api.userId,
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function (res) {
            //--init data
            var status = res.data.status;
            if (status == 1) {
              wx.showToast({
                title: '操作成功！',
                duration: 2000
              });
              setTimeout(function () {
                that.onShow();
              }, 2300);
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
              title: '网络异常！',
              duration: 2000
            });
          }
        });
      }
    });
  },

  //下单支付
  buynow: function (e) {
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/Wxpay/wxpay',
      data: {
        otype: 2,
        uid: app.api.userId,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
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
              app.api.userType = 2;
              wx.showToast({
                title: "支付成功!",
                duration: 2000,
              });
              that.setData({
                hidden: !that.data.hidden
              });
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
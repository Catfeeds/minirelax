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
    pan:[],
    page: 2,
    currentName: '',
    currentId: 0,
    is_qx:0,
    nullHouse: true,  //先设置隐藏
    showModalStatus: false,
    hidden:true,
    left:"5",
    top: "400",
    right:"right",
    pageHidden:'auto',
    otype: 0,
  },
  hiddens(e) {
    this.setData({
      nullHouse: true
    })
  },
  radioChange: function (e) {
    this.setData({
      otype: e.detail.value,
    });
  },
  //  show: function (e) {
  //   var that = this,
  //     //获取当前图片的下表
  //     index = e.currentTarget.dataset.index,
  //     //数据源
  //     pictures = this.data.pan;
  //   wx.previewImage({
  //     //当前显示下表
  //     current: pictures,
  //     //数据源
  //     urls: pictures
  //   })
  // },
  //手指放开
  mytouchend:function(e) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (that.data.left > res.windowWidth / 2) {
          that.setData({
            right:"right",
            left:5,
            pageHidden: 'auto'
          })
        } else {
          that.setData({
            // right: "left",
            left: 5,
            pageHidden: 'auto'
          })
        }
      }   
    })
  },
  //点击图片移动
  viewTouchMove: function (e) {
    var that = this;
    that.setData({
      right:"left",
      left: e.touches[0].clientX-10,
      top: e.touches[0].clientY-10,
      pageHidden:'hidden'
    })
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
    });
  },

  onShow: function () {
    this.loadData();
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    this.setData({
      currentName: currentName,
      currentId: currentId,
      page: 2,
    });
  },

  //加载所有会员分享
  loadData: function(){
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    });
    var that = this;
    that.setData({
      userType: app.api.userType,
    });
    wx.request({
      url: app.api.hostUrl + '/Api/user/study_list',
      method: 'post',
      data: {
        uid: app.api.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var List = res.data.list;
        if (List==''){
          wx.showToast({
            title: '没有找到数据！',
            duration: 2000
          });
        }
        that.setData({
          pan: List,
          is_qx: res.data.is_qx,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:loadData',
          duration: 2000
        });
      },
    })
  },

  classname: function () {
    var that = this;
    var userType = app.api.userType;
    if (userType<=1) {
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
  aa: function () {

    this.setData({
      nullHouse: true, //弹窗显示
    })
  },

  //当前播放点击事件
  bindCurrent: function (e){
    var index = parseInt(e.currentTarget.dataset.id);
    var title = this.data.currentName;
    wx.navigateTo({
      url: '../music/music?objectId=' + index + '&title=' + title + '&ptype=biji'
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
      url: '../music/music?objectId=' + proId + '&title=' + title + '&ptype=biji'
    })
  },

  //头像点击事件
  userinfo: function (e) {
    var userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '../userinfo/userinfo?userId=' + userId,
    });
  },

  //内容点击事件
  notes: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../notes/notes?noteId=' + id,
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
//上拉刷新
  pullUpLoad: function () {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.api.hostUrl + '/Api/user/study_list',
      method: 'post',
      data: {
        uid: app.api.userId,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.log(res.data.list)
        var List = res.data.list;
        if (List == '') {
          var len = that.data.pan.length;
          if (len > 0) {
            wx.showToast({
              title: '已经到底了！',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: '没有找到数据！',
              duration: 2000
            });
          }
        }
        that.setData({
          pan: that.data.pan.concat(List),
          page: parseInt(page) + 1,
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！err:loadData',
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
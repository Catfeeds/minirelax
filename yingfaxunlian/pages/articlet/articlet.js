// var Util = require("../../utils/imgsize.js");
import Util from '../../utils/imgsize';  
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
     imageWidth: 0,
     imageHeight: 0,
    slideshow: false,
    selectedId: '',
    width: 0,
    height: 0,
    pan: [],
    images: [
      {
        pag: '../images/lt.jpg',
      },
    ],
    page: 2,
    currentName: '',
    currentId: 0,
    userId: 0,
    stype:'',
    userType:1,
    hidden:true,
    dateList: [],
  },
  Hidden: function () {
    this.setData({
      hidden:true
    })
  },// 弹窗
  Show: function (e) {
    this.setData({
      hidden:false
    })
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
  imageLoad: function (e) {
     console.log(e)
     //获取图片的原始宽度和高度  
     let originalWidth = e.detail.width;
     let originalHeight = e.detail.height;
     let imageSize = Util.imageZoomHeightUtil(originalWidth,originalHeight-150);  

     //let imageSize = Util.imageZoomHeightUtil(originalWidth,originalHeight,375);  
   //   let imageSize = Util.imageZoomWidthUtil(originalWidth, originalHeight, );

     this.setData({ imageWidth: imageSize.imageWidth, imageHeight: imageSize.imageHeight });
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
    var userId = options.userId;
    if (parseInt(userId) > 0) {
      this.setData({
        userId: userId,
        stype: options.stype,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    });
    this.loadData();
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    this.setData({
      currentName: currentName,
      currentId: currentId,
    });
  },

  //加载所有会员分享
  loadData: function () {
    var that = this;
    var uid = that.data.userId;
    if (!uid) {
      uid = app.api.userId;
    }
    wx.request({
      url: app.api.hostUrl + '/Api/user/mystudy',
      method: 'post',
      data: {
        uid: uid,
        stype: that.data.stype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var List = res.data.list;
        if (List == '') {
            wx.showToast({
              title: '没有找到数据！',
              duration: 2000
            });
            return false;
        }
        var dlist = res.data.dlist;
        that.setData({
          pan: List,
          userType: app.api.userType,
          page:2,
          dateList: dlist,
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

  /**
   * 发布笔记
   */
  fabu: function (e) {
    var that = this;
    var proId = parseInt(e.currentTarget.dataset.id);
    wx.showModal({
      title: '发布提示',
      content: '你确定要发布笔记吗？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/study_edit',
          method: 'post',
          data: {
            pro_id: proId,
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
                title: '打卡成功！',
                duration: 2000
              });
              that.loadData();
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

  //课程点击事件
  pro: function (e) {
    var proId = parseInt(e.currentTarget.dataset.proid);
    var title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../music/music?objectId=' + proId + '&title=' + title
    })
  },

  //内容点击事件
  notes: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../notes/notes?noteId=' + id,
    });
  },

  onReady: function () {
    //页面渲染完成
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var page = that.data.page;
    var uid = that.data.userId;
    if (!uid) {
      uid = app.api.userId;
    }
    wx.request({
      url: app.api.hostUrl + '/Api/user/mystudy',
      method: 'post',
      data: {
        uid: uid,
        stype: that.data.stype,
        page: that.data.page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var List = res.data.list;
        if (List == '') {
          return false;
        }
        that.setData({
          pan: that.data.pan.concat(List),
          page: parseInt(page)+1,
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
// var Util = require("../../utils/imgsize.js");
import Util from '../../utils/imgsize';  
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    width: 0,
    height: 0,
    pan: [],
    page: 2,
    currentName: '',
    currentId: 0,
    userId: 0,
    hidden:true
  },
  Hidden:function(e) {
    this.setData({
      hidden:true
    })
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  // 弹窗
  Show: function (e) {
    this.setData({
      hidden: false
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
    if(parseInt(userId)>0) {
      this.setData({
        userId: userId,
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

  //加载所有会员回答
  loadData: function () {
    var that = this;
    var uid = that.data.userId;
    if(!uid){
      uid = app.api.userId;
    }
    wx.request({
      url: app.api.hostUrl + '/Api/user/myanswer',
      method: 'post',
      data: {
        uid: uid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var List = res.data.list;
        if (List == '') {
          wx.showToast({
            title: '无提问记录！',
            duration: 2000
          });
        }
        that.setData({
          pan: List,
          page: 2,
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

  //问题点击事件
  question: function (e) {
    var qid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../comment/comment?qid=' + qid,
    })
  },

  //头像点击事件
  userinfo: function (e) {
    var userId = e.currentTarget.dataset.userid;
    wx.navigateTo({
      url: '../userinfo/userinfo?userId=' + userId,
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
      url: app.api.hostUrl + '/Api/user/myanswer',
      method: 'post',
      data: {
        uid: uid,
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
          title: '网络异常！',
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
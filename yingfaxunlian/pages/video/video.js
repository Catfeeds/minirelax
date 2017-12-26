// pages/video/video.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  video:'http://gzleren.com/miniread/Data/UploadFiles/vedio/miniread.m4v',
    src:'',
    hidden:false,
    Tap: 0,
    cid: 0,
    title: '',
    list: [],
    info: {},
    page: 2,
    userType: 1,
    dataIndex:111
  },

  TapClick:function (e) {
    this.setData({
      Tap: e.target.id
    })
  },

  bindButtonTap: function (e) {
    console.log(e)
    console.log(e.target.dataset.index)
    var that = this;
    that.setData({
      dataIndex: e.target.dataset.index
    })
    var id = e.currentTarget.dataset.id;
    var is_free = e.currentTarget.dataset.free;
    var userType = app.api.userType;
    if (is_free>1 && userType<=1) {
      return false;
    }
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getvideoxq',
      method: 'post',
      data: {
        uid: app.api.userId,
        id: id,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status==1) {
          var info = res.data.info;
          var content = info.content;
          WxParse.wxParse('content', 'html', content, that, 5);
          that.setData({
            title: info.name,
            src: info.papers,
            hidden: true,
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
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cid = options.cid;
    var title = options.title;
    this.setData({
      cid: cid,
      title: title,
      userType: app.api.userType,
    });
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
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    var that = this;
    var catId = that.data.cid;
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getvideo',
      method: 'post',
      data: {
        uid: app.api.userId,
        cid: catId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        var info = res.data.info;
        var content = info.desc;
        WxParse.wxParse('content', 'html', content, that, 1);
        that.setData({
          list: list,
          info: info,
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
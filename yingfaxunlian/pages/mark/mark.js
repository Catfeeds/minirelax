// var Util = require("../../utils/imgsize.js");
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
    uid:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var currentName = wx.getStorageSync('currentName');
    var currentId = wx.getStorageSync('currentId');
    var userId = options.userId;
    this.setData({
      currentName: currentName,
      currentId: currentId,
      uid: userId,
    });
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

  //加载所有会员mark
  loadData: function () {
    var that = this;
    var uid = that.data.uid;
    if (!uid) {
      uid = app.api.userId;
    }
    wx.request({
      url: app.api.hostUrl + '/Api/user/mymark',
      method: 'post',
      data: {
        uid: uid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var List = res.data.list;
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

  onReady: function () {
    //页面渲染完成
    wx.hideToast();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.api.hostUrl + '/Api/user/mymark',
      method: 'post',
      data: {
        uid: app.api.userId,
        page: page,
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
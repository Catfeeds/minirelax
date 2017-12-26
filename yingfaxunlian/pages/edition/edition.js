// pages/edition/edition.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    tid:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var tid = options.tid;
    this.setData({
      tid: tid
    });
    var title = options.title;
    wx.setNavigationBarTitle({
      title: title,
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
    });
    var that = this;
    var tid = that.data.tid;
    wx.request({
      url: app.api.hostUrl + '/Api/Category/getcat',
      method: 'post',
      data: {
        tid: tid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        that.setData({
          list: list,
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

  //跳转
  tiaoz: function (e) {
    var id = e.currentTarget.dataset.id;
    var count = e.currentTarget.dataset.count;
    var title = e.currentTarget.dataset.title;
    if (count > 0) {
      wx.navigateTo({
        url: '../edition2/edition2?tid=' + id + '&title=' + title
      });
    } else {
      wx.navigateTo({
        url: '../editionData2/editionData2?catId=' + id + '&title=' + title
      });
    }
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
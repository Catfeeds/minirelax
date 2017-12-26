//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    list: [],
    page:2,
    catId:0,
    mingzi:"",
  },

  //事件处理函数
  bindViewTa: function (e) {
    // 取出id值
    var index = parseInt(e.currentTarget.dataset.id);
    var title = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: '../music/music?objectId=' + index + '&title=' + title
    })
  },

  onLoad: function (options) {
    var catId = options.catId;
    var title = options.title;
    this.setData({
      catId: catId,
    });
    wx.setNavigationBarTitle({
      title: title,
    });
  },

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
        cat_id: catId
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        that.setData({
          list: list,
          mingzi: res.data.catname,
          page:2,
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

  onReachBottom: function() {
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
        if (list==''){
          return false;
        }
        that.setData({
          list: that.data.list.concat(list),
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

  onReady: function() {
    //页面渲染完成
  },
})

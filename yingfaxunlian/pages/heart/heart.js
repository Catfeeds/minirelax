const uploadFileUrl = require('../../config').uploadFileUrl;
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    playId: 0,
    name:'',
    img1:'',
    img2:'',
    img3:'',
    btype:1,
    content:'',
    htype: '',
    showtype: 0,
  },

  // 上传图片1
  chooseImage: function () {
    var self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var imageSrc = res.tempFilePaths[0]
        //图片上传服务器
        wx.uploadFile({
          url: app.api.hostUrl + '/Api/User/uploadimg',
          filePath: imageSrc,
          name: 'img',
          formData: {
            uid: app.api.userId,
            imgs: self.data.img1,
          },
          header: {
            'Content-Type': 'multipart/form-data'
          },
          success: function (res) {
            var statusCode = res.statusCode;
            if (statusCode == 200) {
              wx.showToast({
                title: '上传成功',
                duration: 2000
              })
              self.setData({
                imageSrc,
                img1:res.data,
              })
            }else{
              wx.showToast({
                title: 'upload_failed !',
                duration: 2000
              })
            }
          },
          fail: function ({errMsg}) {
            console.log('uploadImage fail, errMsg is', errMsg)
            wx.showToast({
              title: '上传失败',
              duration: 2000
            })
          }
        })
      },
      fail: function ({errMsg}) {
        console.log('chooseImage fail, err is', errMsg)
        wx.showToast({
          title: '图片选取失败',
          duration: 2000
        })
      }
    })
  },
   // 上传图片2
  choose: function () {
    var self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var image = res.tempFilePaths[0];
        //图片上传服务器
        wx.uploadFile({
          url: app.api.hostUrl + '/Api/User/uploadimg',
          filePath: image,
          name: 'img',
          formData: {
            uid: app.api.userId,
            imgs: self.data.img2,
          },
          header: {
            'Content-Type': 'multipart/form-data'
          },
          success: function (res) {
            var statusCode = res.statusCode;
            if (statusCode == 200) {
              wx.showToast({
                title: '上传成功',
                duration: 2000
              })
              self.setData({
                image,
                img2: res.data,
              })
            } else {
              wx.showToast({
                title: 'upload_failed !',
                duration: 2000
              })
            }
          },
          fail: function ({errMsg}) {
            console.log('uploadImage fail, errMsg is', errMsg);
            wx.showToast({
              title: '上传失败',
              duration: 2000
            })
          }
        })
      },
      fail: function ({errMsg}) {
        console.log('chooseImage fail, err is', errMsg);
        wx.showToast({
          title: '图片选取失败',
          duration: 2000
        })
      }
    })
  },

  // 上传图片3
  choo: function () {
    var self = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        var img = res.tempFilePaths[0];
        //图片上传服务器
        wx.uploadFile({
          url: app.api.hostUrl + '/Api/User/uploadimg',
          filePath: img,
          name: 'img',
          formData: {
            uid: app.api.userId,
            imgs: self.data.img3,
          },
          header: {
            'Content-Type': 'multipart/form-data'
          },
          success: function (res) {
            var statusCode = res.statusCode;
            if (statusCode == 200) {
              wx.showToast({
                title: '上传成功',
                duration: 2000
              })
              self.setData({
                img,
                img3: res.data,
              })
            } else {
              wx.showToast({
                title: 'upload_failed !',
                duration: 2000
              })
            }
          },
          fail: function ({errMsg}) {
            console.log('uploadImage fail, errMsg is', errMsg);
            wx.showToast({
              title: '上传失败',
              duration: 2000
            })
          }
        })
      },
      fail: function ({errMsg}) {
        console.log('chooseImage fail, err is', errMsg);
        wx.showToast({
          title: '图片选取失败',
          duration: 2000
        })
      }
    })
  },

  //监听文本域输入事件
  changeInput: function (e) {
    this.setData({
      content: e.detail.value,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var playId = options.playId;
    var name = options.title;
    var htype = options.htype;
    var showtype = options.showtype;
    that.setData({
      playId: playId,
      name: name,
      htype: htype,
      showtype: showtype,
    })
  },

  //提交
  bindFormSubmit: function (e) {
    var that = this;
    var playId = that.data.playId;
    var textarea = that.data.content;
    var btype = e.currentTarget.dataset.btype;
    if (!textarea) {
      wx.showToast({
        title: '请先输入您的心得体会再提交！',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.api.hostUrl + '/Api/User/study',
      method: 'post',
      data: {
        pro_id: playId,
        uid: app.api.userId,
        content: textarea,
        adv1: that.data.img1,
        adv2: that.data.img2,
        adv3: that.data.img3,
        btype: btype,
        htype: that.data.htype,//笔记类型
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
            setTimeout(function (e) {
              wx.navigateBack();
            }, 2200);
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

})
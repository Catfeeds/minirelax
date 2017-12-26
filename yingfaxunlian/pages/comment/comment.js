// pages/comment/comment.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qid:0,
    aid:0,
    askid:0,
    info:{},
    list:[],
    is_qx:0,
    page:2,
    mark:0,
    uid:0,
    savetype:1, //1保存回答 2保存追问 3保存追答
    is_gl:0,
  },

  //提交事件
  evaSubmit: function (e) {
    var that = this;
    var is_qx = that.data.is_qx;
    var savetype = that.data.savetype;
    if (is_qx != 1 && savetype!=2) {
      wx.showToast({
        title: '对不起，您没有回答问题的权限！',
        duration: 2000
      });
      return false;
    }

    var content = e.detail.value.evaContent;
    if (!content) {
      wx.showToast({
        title: '请输入您要回复的内容！',
        duration: 2000
      });
      return false;
    }

    if (savetype>1) {
      var urls = app.api.hostUrl + '/Api/User/saveask';
    } else {
      var urls = app.api.hostUrl + '/Api/User/saveanswer';
    }

    wx.request({
      url: urls,
      method: 'post',
      data: {
        uid: app.api.userId,
        content: content,
        qid: that.data.qid,
        savetype: that.data.savetype,
        aid: that.data.aid,
        askid: that.data.askid,
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
          }, 2200);

        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
    });
  },

  //会员mark
  like:function() {//点赞
    var that = this;
    wx.request({
      url: app.api.hostUrl + '/Api/User/mark',
      method: 'post',
      data: {
        uid: app.api.userId,
        qid: that.data.qid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          that.setData({
            mark: !that.data.mark
          });
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
      var currentStatu = e.currentTarget.dataset.statu;
      this.util(currentStatu)
   },

   // 追问 弹窗
   zhuiwen: function (e) {
     var aid = e.currentTarget.dataset.aid;
     this.setData({
       savetype: 2,
       aid: aid,
     });
     this.util('open');
   },

   //追答 弹窗
   zhuida: function (e) {
     var askid = e.currentTarget.dataset.askid;
     this.setData({
       savetype: 3,
       askid: askid,
     });
     this.util('open');
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var qid = options.qid;
    this.setData({
      qid: qid,
      uid: app.api.userId,
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
    var qid = that.data.qid;
    wx.request({
      url: app.api.hostUrl + '/Api/User/getquestion',
      method: 'post',
      data: {
        uid: app.api.userId,
        qid: qid,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          var info = res.data.info;
          var list = res.data.list;
          var is_qx = res.data.is_qx;
          var is_gl = res.data.is_gl;
          var mark = res.data.mark;
          that.setData({
            info: info,
            list: list,
            is_qx: is_qx,
            is_gl: is_gl,
            mark: mark
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
    });
  },

  //管理者删除问题
  delquestion: function (e) {
    var that = this;
    var sid = e.currentTarget.dataset.sid;
    wx.showModal({
      title: '提示',
      content: '您确定要删除吗？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/delquestion',
          method: 'post',
          data: {
            qid: sid,
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
                wx.navigateBack();
              }, 2100);
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

  //会员删除笔记
  delanswer: function (e) {
    var that = this;
    var aid = e.currentTarget.dataset.aid;
    wx.showModal({
      title: '提示',
      content: '是否确定删除？',
      success: function (res) {
        res.confirm && wx.request({
          url: app.api.hostUrl + '/Api/User/delanswer',
          method: 'post',
          data: {
            aid: aid,
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
              }, 2100);
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
    var that = this;
    var qid = that.data.qid;
    var page = that.data.page;
    wx.request({
      url: app.api.hostUrl + '/Api/User/getmorelist',
      method: 'post',
      data: {
        uid: app.api.userId,
        qid: qid,
        page: page,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          var list = res.data.list;
          if (list == ''){
            return false;
          }
          that.setData({
            list: that.data.list.concat(list),
            page: parseInt(page)+1,
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
   data: {
      list: [],
      info: {},
      currentName: '',
      currentId: 0,
      page: 2,
      num: 1,
      ah: '',
      widths:150,
      free:false,
      charge:false,
      yangshi:"",
      tanchuang:true,
   },
   //关闭弹窗
   guanbi:function(e){
    this.setData({
      tanchuang:true
    })
   },

  //问题分页
  pagequestion: function(pageid){
    var that = this;
    var page = that.data.page;
    console.log(page);
    wx.request({
      url: app.api.hostUrl + '/Api/Index/getlist',
      method: 'post',
      data: {
        page: page,
        qtype: that.data.qtype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var list = res.data.list;
        if (list == '') {
          return false;
        }
        that.setData({
          list: that.data.list.concat(list),
          page: parseInt(page) + 1,
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

   //加载问题
   loadquestion: function() {
     var that = this;
     var page = that.data.page;
     wx.request({
       url: app.api.hostUrl + '/Api/Index/getquestion',
       method: 'post',
       data: {
         qtype: that.data.qtype,
       },
       header: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       success: function (res) {
         var list = res.data.list;
         if (list == '') {
           wx.showToast({
             title: '没有找到更多数据！',
             duration: 2000
           });
         }
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

   pinglun: function (e) {
      var qid = e.currentTarget.dataset.qid;
      wx.navigateTo({
         url: '../comment/comment?qid=' + qid,
      })
   },

   // 弹窗
   powerDrawer: function (e) {
      var currentStatu = e.currentTarget.dataset.statu;
      this.util(currentStatu)
   },
   powerDrawers: function (e) {
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

   //事件处理函数
   bindViewTap: function (e) {
      console.log(e)
      // 取出id值
      var that = this;
      // 取得下标
      var index = parseInt(e.currentTarget.dataset.index);
      // 取出id值
      // var objectId = that.data.shiping[index].get('java');
      console.log(that.data.shiping[index].java)
      var objectId = that.data.shiping[index].java

      that.setData({
         mingzi: objectId
      })
      wx.navigateTo({
         url: '../music/music?objectId=' + objectId
      })
   },

   //音频点击事件
   bindViewTa: function (e) {
      var that = this;
      // 取出id值
      var index = parseInt(e.currentTarget.dataset.id);
      var title = e.currentTarget.dataset.name;
      wx.navigateTo({
         url: '../music/music?objectId=' + index + '&title=' + title
      })
   },

   onLoad: function () {
      var that = this;
      var currentName = wx.getStorageSync('currentName');
      var currentId = wx.getStorageSync('currentId');
      that.setData({
         currentName: currentName,
         currentId: currentId,
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
      var that = this;
      var currentName = wx.getStorageSync('currentName');
      var currentId = wx.getStorageSync('currentId');
      that.setData({
         currentName: currentName,
         currentId: currentId,
      });

      var is_new = app.api.is_new;
      if (is_new==1){
        that.setData({
          tanchuang:false,
        });
      }

      wx.request({
         url: app.api.hostUrl + '/Api/Index/index_api',
         method: 'post',
         data: {
            uid: app.api.userId,
         },
         header: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         success: function (res) {
            var info = res.data.info;
            var list = res.data.list;
            that.setData({
               info: info,
               list: list,
            });
         },
      })
   },

   //当前播放点击事件
   bindCurrent: function (e) {
      var index = parseInt(e.currentTarget.dataset.id);
      var title = this.data.currentName;
      wx.navigateTo({
         url: '../music/music?objectId=' + index + '&title=' + title
      })
   },

   //跳转事件
   tiaoz: function (e) {
    var id  = e.currentTarget.dataset.id;
    var cattype = e.currentTarget.dataset.cattype;
    var count = e.currentTarget.dataset.count;
    var title = e.currentTarget.dataset.title;
    if (cattype==1) {
      if (count>0) {
        wx.navigateTo({
          url: '../edition/edition?tid=' + id + '&title=' + title
        });
      } else {
        wx.navigateTo({
          url: '../editionData2/editionData2?catId=' + id + '&title=' + title
        });
      }
    }else if (cattype==2) {
      if (count > 0) {
        wx.navigateTo({
          url: '../ability/ability?tid=' + id + '&title=' + title
        });
      } else {
        wx.navigateTo({
          url: '../video/video?cid=' + id + '&title=' + title
        });
      }
    } else if (cattype==3) {
      if (count > 0) {
        wx.navigateTo({
          url: '../edition/edition?tid=' + id + '&title=' + title
        });
      } else {
        wx.navigateTo({
          url: '../editionData2/editionData2?catId=' + id + '&title=' + title
        });
      }
    } else if(cattype==4) {
      wx.navigateTo({
        url: '../issue/issue?title=' + title
      });
    }
   },

   onReady: function () {
      //页面渲染完成
      var that = this;
      var num = 0;
      var a = 1;
      var i = setInterval(function jk(){
         num = num + a;
         if (that.data.widths == num) {
            num = 0;
            clearInterval(i);
            that.setData({
               num: num
            })

            if (num == 0) {
               setTimeout(function(){
                  i = setInterval(jk, 100)
               },1000)
            } 

         } else {
            that.setData({
               num: num
            })
         }
      }, 100)
   },

   scll: function (e) {
      var that = this
      wx.getSystemInfo({
         success: function (res) {
            var ah = e.detail.scrollWidth - res.windowWidth;
            that.setData({
               ah: ah
            })
         }
      })
   },

   onShareAppMessage: function () {
      return {
         title: '原版阅读',
         path: '/pages/index/index',
         success: function (res) {
            // 分享成功
         },
         fail: function (res) {
            // 分享失败
         }
      }
   }
})

//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    list: [],
    info: {},
    catinfo: [],
    currentName: '',
    currentId: 0,
    page: 2,
    twqtitle: '',
    num: 1,
    ah: '',
    widths: 150,
    pzinfo: {},
    notice: {},
    img: [],
    free: false,
    charge: false,
    style: "style",
    yangshi: "",
    qtype: 1,
  },

  //英语区
  yingyu: function (e) {
    this.setData({
      style: "style",
      yangshi: "",
      qtype: 1,
      page: 2,
    });
    this.loadquestion();
  },

  //法语区
  fayu: function (e) {
    console.log(e)
    this.setData({
      style: "",
      yangshi: "style",
      qtype: 2,
      page: 2,
    });
    this.loadquestion();
  },

  //提问区滚动到底部 监听事件
  lower: function (e) {
    var that = this;
    that.pagequestion();
  },

  //问题分页
  pagequestion: function (pageid) {
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
  loadquestion: function () {
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

  // 点击显示隐藏
  shuxing: function (e) {
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      shuxing: i,
      png: 1,
      id: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        shuxing: i,
        png: 0,
        id: 0,
      })
    }
  },
  mian: function (e) {
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      shuxings: i,
      pngs: 1,
      ids: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        shuxings: i,
        pngs: 0,
        ids: 0,
      })
    }
  },
  who: function (e) {
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      charge: !this.data.charge,
      img: 1,
      ids: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        //  shuxings: i,
        img: 0,
        ids: 0,
      })
    }
  },
  mener: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      shuxingss: i,
      pngss: 1,
      idss: 1,
      free: !this.data.free
    })
    if (id == 1) {
      var i = false;
      this.setData({
        shuxingss: i,
        pngss: 0,
        idss: 0,
      })
    }
  },
  drop: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      dropT: i,
      dropTpngss: 1,
      idss: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        dropT: i,
        dropTpngss: 0,
        idss: 0,
      })
    }
  },
  recommend: function (e) {
    console.log(e);
    var id = e.currentTarget.dataset.id
    var i = true;
    this.setData({
      recommendT: i,
      recommendTpngss: 1,
      idss: 1,
    })
    if (id == 1) {
      var i = false;
      this.setData({
        recommendT: i,
        recommendTpngss: 0,
        idss: 0,
      })
    }
  },


  pinglun: function (e) {
    var qid = e.currentTarget.dataset.qid;
    wx.navigateTo({
      url: '../comment/comment?qid=' + qid,
    })
  },
  //提交事件
  evaSubmit: function (e) {
    var that = this;
    var content = e.detail.value.evaContent;
    if (!content) {
      wx.showToast({
        title: '请输入你要发布的问题！',
        duration: 2000
      });
      return false;
    }

    wx.request({
      url: app.api.hostUrl + '/Api/User/savequestion',
      method: 'post',
      data: {
        uid: app.api.userId,
        qtype: that.data.qtype,
        content: content,
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
          that.util('close');
          setTimeout(function (e) {
            that.onShow();
          }, 2300);

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

  gd: function (e) {
    var catId = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    console.log(name);
    wx.navigateTo({
      url: '../gd/gd?catId=' + catId + '&name=' + name,
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
    wx.request({
      url: app.api.hostUrl + '/Api/Index/index',
      method: 'post',
      data: {
        uid: app.api.userId,
        qtype: that.data.qtype,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var catList = res.data.catlist;
        var info = res.data.info;
        var list = res.data.qlist;
        var twqtitle = res.data.twqtitle;
        var notice = res.data.notice;
        var img = res.data.img;
        //处理公告内容
        var content = notice.concent;
        WxParse.wxParse('content', 'html', content, that, 5);

        that.setData({
          catinfo: catList,
          info: info,
          list: list,
          twqtitle: twqtitle,
          notice: notice,
          img: img,
          page: 1,
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

  //查看更多问题
  getmoreque: function () {
    var that = this;
    var page = that.data.page;
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
          wx.showToast({
            title: '没有找到更多数据！',
            duration: 2000
          });
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

  onReady: function () {
    //页面渲染完成
    wx.hideToast();
    var that = this;
    var num = 0;
    var a = 1;
    var i = setInterval(function jk() {
      num = num + a;
      if (that.data.widths == num) {
        num = 0;
        clearInterval(i);
        that.setData({
          num: num
        })

        if (num == 0) {
          setTimeout(function () {
            i = setInterval(jk, 100)
          }, 1000)
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
  fsd: function (e) {
    console.log(e);
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

var app = getApp();
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    nullHouse: true,  //先设置隐藏
    showModalStatus: false,
    playing: false,
    playTime: 0,
    formatedPlayTime: '00:00',
    p: 1,
    time_total_str: '00:00',
    info: {},
    lastPlayId: 0,
    isFree: 1,
    totaltime: 0,
    showStatus: 0,
    userType: 1,
    // a:0,
  },
  aa: function () {

    this.setData({
      nullHouse: true, //弹窗显示
    })
  },
  clickArea: function () {
    this.setData({
      nullHouse: false, //弹窗显示
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
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
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  onLoad: function (options) {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
    })
    var that = this;
    wx.setNavigationBarTitle({
      title: options.title,
    });
    that.setData({
      userType: app.api.userType,
    })
    var playId = options.objectId;
    console.log(playId);
    this._enableInterval();
    if (app.globalData.backgroundAudioPlaying) {
      that.setData({
        playing: true
      })
    }
    wx.request({
      url: app.api.hostUrl + '/Api/Product/index',
      method: 'post',
      data: {
        pro_id: playId,
        uid: app.api.userId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        that.setData({
          showStatus: res.data.is_open,
        });
        if (status == 1) {
          var info = res.data.pro;
          app.api.userType = res.data.userType;
          var content = info.content;
          WxParse.wxParse('content', 'html', content, that, 1);

          // setTimeout(function (e) {


          // }, 2000)

          that.setData({
            info: info,
            isFree: info.is_free,
            time_total_str: info.thetime,
            userType: res.data.userType,
          });
          wx.getBackgroundAudioPlayerState({
            success: function (res) {
              var total = res.duration;
              that.setData({
                time_total_str: util.formatTime(total),
                totaltime: res.duration
              })
            }
          })
          wx.setStorageSync('currentName', info.name);
          wx.setStorageSync('currentId', info.id);

          var lastPlayId = wx.getStorageSync('lastPlayId');


          if (info.id != lastPlayId) {
            that.setData({
              formatedPlayTime: '00:00',
              playing: false,
              lastPlayId: lastPlayId
            });
            that.stop();
            var currtime = wx.getStorageSync('lasttime');
            //记录上一条的收听记录
            if (lastPlayId && currtime) {
              that.logold();
              wx.removeStorageSync('lasttime');
            }
          }
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
      complete: function (e) {
        wx.hideToast();
      },
    })

  },


  //保存上一条收听记录
  logold: function (e) {
    var that = this;
    var playId = wx.getStorageSync('lastPlayId');
    var currtime = wx.getStorageSync('lasttime');
    wx.request({
      url: app.api.hostUrl + '/Api/User/recordlogold',
      method: 'post',
      data: {
        play_id: playId,
        uid: app.api.userId,
        currtime: currtime,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {

      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },

  //写心得点击事件
  ping: function () {
    var playId = this.data.info.id;
    var title = this.data.info.name;
    wx.navigateTo({
      url: '../heart/heart?showtype=1&playId=' + playId + '&title=' + title,
    });
  },

  //开通会员
  payuser: function () {
    wx.navigateTo({
      url: '../settled/settled',
    })
  },

  //点击播放
  play: function (res) {
    var that = this;
    var userType = app.api.userType;
    var isFree = that.data.isFree;
    if (userType == 1 && isFree > 1) {
      wx.showModal({
        title: '收听提示',
        content: '该节目仅限购买会员收听哦，赶紧去开通吧！',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              nullHouse: false, //弹窗显示
            })
          }
        }
      })
      return false;
    }
    var info = that.data.info;
    wx.playBackgroundAudio({
      dataUrl: info.papers,
      title: info.name,
      coverImgUrl: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
      complete: function (res) {
        var shopid = info.id;
        that.setData({
          playing: true,
        });
        //设置缓存
        wx.setStorageSync('lastPlayId', shopid);
        //记录收听记录
        that.log();
      }
    })
    this._enableInterval();
    app.globalData.backgroundAudioPlaying = true;
    //计算总时长
    setTimeout(function (e) {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {
          var total = res.duration;
          that.setData({
            time_total_str: util.formatTime(total),
            totaltime: total,

          })
        }
      })
    }, 2000);
  },

  //点击暂停
  pause: function () {

    var that = this
    wx.pauseBackgroundAudio({
      dataUrl: that.data.info.papers,
      success: function () {
        that.setData({
          playing: false,
          a: 2
        })
      }
    })
    app.globalData.backgroundAudioPlaying = false;
    //记录收听记录
    that.log();
    // clearInterval(that.updateInterval)
  },

  /** 
    * 播放状态 
    +7
    */
  listenerButtonGetPlayState: function () {
    var that = this;
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var total = res.duration;
        that.setData({
          p: 0,
          time_total_str: util.formatTime(total)
        })
      }
    })
  },

  /** 
    * 播放状态 ——7
    */
  mytouchmov: function () {
    var that = this;
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var total = res.duration;
        that.setData({
          p: 2,
          time_total_str: util.formatTime(total)
        })
      }
    })
  },

  stop: function () {
    var that = this
    wx.stopBackgroundAudio({
      dataUrl: that.data.info.papers,
      success: function (res) {
        that.setData({
          playing: false,
          playTime: 0,
          formatedPlayTime: util.formatTime(0)
        })
      }
    })
    app.globalData.backgroundAudioPlaying = false
  },

  _enableInterval: function () {
    var that = this;
    update();
    var a = that.data.a;
    that.updateInterval = setInterval(update, 1000);
    // if(a==2){
    //   clearInterval(that.updateInterval);
    // }
    function update() {
      wx.getBackgroundAudioPlayerState({
        success: function (res) {

          var currentPosition = res.currentPosition;
          // console.log(res)
          if (that.data.p == 0) {
            var currentPosition = res.currentPosition + 7;
            wx.seekBackgroundAudio({
              position: currentPosition,
            })
            that.setData({
              p: 1
            })
          }
          if (that.data.p == 2) {
            var currentPosition = res.currentPosition - 7;
            wx.seekBackgroundAudio({
              position: currentPosition,
            })
            that.setData({
              p: 1
            })
          }
          that.setData({
            playTime: currentPosition,
            formatedPlayTime: util.formatTime(currentPosition)
          });
          //听完事件
          var mytime = that.data.formatedPlayTime;
          var sumtime = that.data.time_total_str;
          wx.setStorageSync('lasttime', mytime);
          var lastPlayId = that.data.lastPlayId;
          var currentId = that.data.info.id;
          if (sumtime && mytime == sumtime) {
            that.logover();
            that.stop();
          }
        }
      })
    }
  },

  //保存收听记录
  log: function (e) {
    var that = this;
    var playId = wx.getStorageSync('lastPlayId');
    wx.request({
      url: app.api.hostUrl + '/Api/User/recordlog',
      method: 'post',
      data: {
        play_id: playId,
        uid: app.api.userId,
        thetime: that.data.formatedPlayTime,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {

      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },

  //收听完记录
  logover: function (e) {
    var that = this;
    var playId = wx.getStorageSync('lastPlayId');
    wx.request({
      url: app.api.hostUrl + '/Api/User/recordlogover',
      method: 'post',
      data: {
        play_id: playId,
        uid: app.api.userId,
        longtime: that.data.time_total_str
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {

      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },





  // 时间计算

  // 转换时间格式
  // getTimeStr: function (total) {
  //   var str = '';
  //   var minute = parseInt(total / 60) < 10
  //     ? ('0' + parseInt(total / 60))
  //     : (parseInt(total / 60));
  //   var second = total % 60 < 10
  //     ? ('0' + total % 60)
  //     : (total % 60);
  //   str = minute + ':' + second;
  //   return str;
  // },


  // getTimeSt: function (total) {
  //   var formatedPlayTime = '';
  //   var minute = parseInt(total / 60) < 10
  //     ? ('0' + parseInt(total / 60))
  //     : (parseInt(total / 60));
  //   var second = total % 60 < 10
  //     ? ('0' + total % 60)
  //     : (total % 60);
  //   formatedPlayTime = minute + ':' + second;
  //   return formatedPlayTime;
  // },


  // getTimeStr:function (total) {
  //   var miao = total % 60
  //   var fen = (total - miao) / 60
  //   var time_total_str = ""
  //   if (fen < 10) {
  //     time_total_str = time_total_str + '0' + fen.toString() + ':'
  //   } else {
  //     time_total_str = time_total_str + fen.toString() + ':'
  //   }
  //   if (miao < 10) {
  //     time_total_str = time_total_str + '0' + miao.toString()
  //   } else {
  //     time_total_str = time_total_str + miao.toString()
  //   }
  //   return time_total_str
  // },

  //    getTimeStr: function (total) {
  //     if(typeof total !== 'number' || total < 0) {
  //   return total
  // }

  // var hour = parseInt(total / 3600)
  // total = total % 3600
  // var minute = parseInt(total / 60)
  // total = total % 60
  // var second = total

  // return ([minute, second]).map(function (n) {
  //   n = n.toString()
  //   return n[1] ? n : '0' + n
  // }).join(':')

  // },
  onUnload: function () {
    clearInterval(this.updateInterval)
  },

  //下单支付
  buynow: function (e) {
    var that = this;
    var otype = parseInt(e.currentTarget.dataset.otype);
    wx.request({
      url: app.api.hostUrl + '/Api/Wxpay/wxpay',
      data: {
        otype: otype,
        uid: app.api.userId,
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }, // 设置请求的 header
      success: function (res) {
        if (res.data.status == 1) {
          var order = res.data.arr;
          wx.requestPayment({
            timeStamp: order.timeStamp,
            nonceStr: order.nonceStr,
            package: order.package,
            signType: 'MD5',
            paySign: order.paySign,
            success: function (res) {
              that.setData({
                showModalStatus: false
              });
              if (otype == 3) {
                app.api.userType = 3;
                wx.showModal({
                  title: '支付成功',
                  content: '请添加管家微信小橙 chs_177',
                  success: function (res) {
                    if (res.confirm) {

                    }
                  }
                })
              } else {
                app.api.userType = 2;
                wx.showToast({
                  title: "支付成功!",
                  duration: 2000,
                });
                // setTimeout(function () {
                //   this.onLoad();
                // }, 2500);
              }

            },
            fail: function (res) {
              wx.showToast({
                title: res,
                duration: 3000
              })
            }
          })
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
          title: '网络异常！err:buynow',
          duration: 2000
        });
      }
    })
  }
})

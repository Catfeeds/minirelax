function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatTimess(time) {
  var str = '';
  var minute = parseInt(time / 60) < 10
    ? ('0' + parseInt(time / 60))
    : (parseInt(time / 60));

  var second = time % 60 < 10
    ? ('0' + time % 60)
    : (time % 60);


  str = minute + ':' + second;
  return str;
}


// function formatTime(time) {
//   var str = '';
//   if (typeof time !== 'number' || time < 0) {
//     return time
//   }
//   var minute = parseInt(time / 60) < 10
//     ? ('0' + parseInt(time / 60))
//     : (parseInt(time / 60));

//   var second = parseInt(time % 60) < 10
//     ? ('0' + parseInt(time % 60)):(parseInt(time % 60));
//   str = minute + ':' + second;
//      return str;

// }


function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = parseInt(time % 60)
  var second = time

  return ([minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}





function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

module.exports = {
  formatTime: formatTime,
  formatTimess: formatTimess,
  formatLocation: formatLocation
}
// module.exports = {
//   formatTime: formatTime
// }




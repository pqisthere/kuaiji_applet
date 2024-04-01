function getCurrentDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  // 格式化月份，日期，小时，分钟，确保它们在两位数以上
  month = month < 10 ? '0' + month : month;
  date = date < 10 ? '0' + date : date;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // 返回拼接后的日期和时间字符串
  var currentDate = year + '-' + month + '-' + date;
  // var currentDate = month + '-' + date;
  var currentTime = hours + ':' + minutes;

  return {
    currentDate: currentDate,
    currentTime: currentTime
  };
}

module.exports = {
  getCurrentDateTime: getCurrentDateTime
};
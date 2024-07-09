const str2gbk = require('./gbk')

// 串口消息队列
class MessageQueue {
  MAX_QUEUE_LENGTH = 10000
  constructor() {
    this.data = '';
  }

  add(message) {
    if (this.data.length >= this.MAX_QUEUE_LENGTH) {
      this.data.substring(0, 5000); // 删除前面的旧数据
    }
    this.data += message;
  }

  getData() {
    return this.data
  }

  reset() {
    this.data = '';
  }
}

// 生成屏幕指令, unicode 转 gb2312 转 16 进制
function generateScreenCommandBody(str) {
  const encodedBytes = str2gbk(str);
  // 转十六进制字符串
  const hexString = Array.from(encodedBytes).map(byte => byte.toString(16).toUpperCase().padStart(2, '0')).join('');
  return hexString
}

module.exports = {
  generateScreenCommandBody,
  MessageQueue
}

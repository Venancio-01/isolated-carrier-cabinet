import str2gbk from "./gbk";

// 串口消息队列
class MessageQueue {
  MAX_QUEUE_LENGTH = 10000;
  data: string; // Declare the data property

  constructor() {
    this.data = "";
  }

  add(message: string) {
    // Specify type for message
    if (this.data.length >= this.MAX_QUEUE_LENGTH) {
      this.data = this.data.substring(5000); // Update to assign the result
    }
    this.data += message;
  }

  getData() {
    return this.data;
  }

  reset() {
    this.data = "";
  }
}

// 生成屏幕指令, unicode 转 gb2312 转 16 进制
function generateScreenCommandBody(str: string) {
  // Specify type for str
  const encodedBytes = str2gbk(str);
  // 转十六进制字符串
  const hexString = Array.from(encodedBytes)
    .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
    .join("");
  return hexString;
}

export { generateScreenCommandBody, MessageQueue };

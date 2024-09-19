"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueue = void 0;
exports.generateScreenCommandBody = generateScreenCommandBody;
const gbk_1 = __importDefault(require("./gbk"));
// 串口消息队列
class MessageQueue {
    constructor() {
        this.MAX_QUEUE_LENGTH = 10000;
        this.data = "";
    }
    add(message) {
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
exports.MessageQueue = MessageQueue;
// 生成屏幕指令, unicode 转 gb2312 转 16 进制
function generateScreenCommandBody(str) {
    // Specify type for str
    const encodedBytes = (0, gbk_1.default)(str);
    // 转十六进制字符串
    const hexString = Array.from(encodedBytes)
        .map((byte) => byte.toString(16).toUpperCase().padStart(2, "0"))
        .join("");
    return hexString;
}

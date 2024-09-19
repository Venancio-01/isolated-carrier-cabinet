"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const emit_1 = __importDefault(require("./utils/emit"));
const util_1 = require("./utils/util");
const logger_1 = __importDefault(require("./utils/logger"));
const rfid_utils_1 = require("rfid-utils");
const port = new serialport_1.SerialPort({
    path: "/dev/ttyS1",
    baudRate: 115200,
});
const messageQueue = new util_1.MessageQueue();
port.on("open", function () {
    logger_1.default.info("Rfid SerialPort Open");
});
port.on("data", function (data) {
    const hexData = data.toString("hex");
    logger_1.default.info("Rfid Data:" + hexData);
    messageQueue.add(hexData);
});
function writeCommand(command) {
    port.write(command, err => {
        if (err) {
            console.error("Error writing to rfid serial port:", err);
        }
        logger_1.default.info("Command written to rfid serial port:" + command.toString("hex"));
    });
}
let countdown = 5;
let timer = null;
function startReading() {
    logger_1.default.info("Start reading RFID...");
    // 重置消息队列
    messageQueue.reset();
    const antennaIds = [1, 2, 3, 4];
    const startCommand = (0, rfid_utils_1.generateStartCommand)(antennaIds);
    writeCommand((0, rfid_utils_1.generateStopCommand)());
    writeCommand(startCommand);
    countdown = 5;
    if (timer)
        clearInterval(timer);
    emit_1.default.emit("updateCountdown", countdown);
    timer = setInterval(() => {
        countdown--;
        emit_1.default.emit("updateCountdown", countdown);
        if (countdown <= 0) {
            stopReading();
            timer && clearInterval(timer);
            timer = null;
        }
    }, 1000);
}
function stopReading() {
    writeCommand((0, rfid_utils_1.generateStopCommand)());
    getRfidTIDList();
}
function getRfidTIDList() {
    const data = messageQueue.getData();
    const TIDList = (0, rfid_utils_1.getTIDList)(data);
    logger_1.default.info("检测到 Rfid TID 数量:" + TIDList.length);
    emit_1.default.emit("updateScreen", TIDList.length);
}
emit_1.default.on("startRfidReading", startReading);
function cleanup() {
    // 停止读取器读取
    const command = Buffer.from("5A000102FF0000885A", "hex");
    writeCommand(command);
}
function handleExit(options, exitCode) {
    if (options.cleanup)
        cleanup();
    if (exitCode || exitCode === 0)
        console.log(exitCode);
    if (options.exit)
        process.exit();
}
// 当进程即将退出时
process.on("exit", code => {
    handleExit({ cleanup: true }, code);
});
// 捕捉 Ctrl+C 事件
process.on("SIGINT", () => {
    console.log("Received SIGINT. Exiting...");
    handleExit({ cleanup: true, exit: true });
});
// 捕捉终止信号
process.on("SIGTERM", () => {
    console.log("Received SIGTERM. Exiting...");
    handleExit({ cleanup: true, exit: true });
});
// 捕捉未捕获的异常
process.on("uncaughtException", err => {
    console.error("Uncaught Exception:", err);
    handleExit({ cleanup: true, exit: true }, 1);
});
module.exports = {
    startReading,
};

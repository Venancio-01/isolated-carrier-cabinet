"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const emit_1 = __importDefault(require("./utils/emit"));
const util_1 = require("./utils/util");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = __importDefault(require("./utils/logger"));
console.log("screen module loaded");
const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const port = new serialport_1.SerialPort({
    path: "/dev/ttyS2",
    baudRate: 115200,
    // baudRate: 57600, // 常见的波特率还有9600、19200、38400、57600等
});
port.on("open", function () {
    logger_1.default.info("Screen SerialPort Open");
    initScreen();
});
port.on("data", function (data) {
    logger_1.default.info("Screen Data:" + data.toString("hex"));
});
function writeCommand(command) {
    port.write(command, err => {
        if (err) {
            console.error("Error writing to screen serial port:", err);
        }
        logger_1.default.info("Command written to screen serial port:" + command.toString("hex"));
    });
}
function generateCommand(body) {
    const head = "A55A";
    const prefix = "82";
    const end = "FFFF";
    const len = ((head.length + prefix.length + end.length + body.length) / 2 - 2).toString(16).padStart(2, "0");
    const commandStr = `${head}${len}${prefix}${body}${end}`;
    const buf = Buffer.from(commandStr, "hex");
    return buf;
}
const block1 = "0000";
const block2 = "0600";
const block3 = "0300";
const block4 = "0362";
function initScreen() {
    const command1 = generateCommand(`${block1}${(0, util_1.generateScreenCommandBody)("在柜文件：0")}`);
    const command2 = generateCommand(`${block2}${(0, util_1.generateScreenCommandBody)("")}`);
    const command3 = generateCommand(`${block3}${(0, util_1.generateScreenCommandBody)("   " + config.user)}`);
    const command4 = generateCommand(`${block4}${(0, util_1.generateScreenCommandBody)("")}`);
    const commands = [command1, command2, command3, command4];
    console.log("🚀 - initScreen - commands:", commands);
    commands.forEach(command => {
        writeCommand(command);
    });
}
function updateRfidCount(count) {
    const commandBody = (0, util_1.generateScreenCommandBody)(count.toString().padStart(3, " "));
    const command = generateCommand(`${block1}${commandBody}`);
    writeCommand(command);
}
function updatePrompt(countdown) {
    const body = countdown === 0
        ? (0, util_1.generateScreenCommandBody)("")
        : (0, util_1.generateScreenCommandBody)(`  检测中-${countdown}`);
    const command = generateCommand(`${block4}${body}`);
    writeCommand(command);
}
emit_1.default.on("updateScreen", (count) => {
    updateRfidCount(count);
});
emit_1.default.on("updateCountdown", (countdown) => {
    logger_1.default.info("updateCountdown", countdown);
    updatePrompt(countdown);
});

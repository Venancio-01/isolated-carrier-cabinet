import { SerialPort } from "serialport";
import eventEmitter from "./utils/emit";
import { generateScreenCommandBody } from "./utils/util";
import * as path from 'path';
import * as fs from 'fs';
import logger from "./utils/logger";

console.log("screen module loaded");

const configPath = path.resolve(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const port = new SerialPort({
  path: "/dev/ttyS2",
  baudRate: 115200,
  // baudRate: 57600, // 常见的波特率还有9600、19200、38400、57600等
});

port.on("open", function () {
  logger.info("Screen SerialPort Open");
  initScreen();
});

port.on("data", function (data: Buffer) {
  logger.info("Screen Data:" + data.toString("hex"));
});

function writeCommand(command: Buffer | string) {
  port.write(command, err => {
    if (err) {
      console.error("Error writing to screen serial port:", err);
    }

    logger.info("Command written to screen serial port:" + command.toString("hex"));
  });
}

function generateCommand(body: string) {
  const head = "A55A";
  const prefix = "82";
  const end = "FFFF";
  const len = ((head.length + prefix.length + end.length + body.length) / 2 - 2).toString(16).padStart(2, "0");

  const commandStr = `${head}${len}${prefix}${body}${end}`;
  const buf = Buffer.from(commandStr, "hex");

  return buf;
}

const block1 = "01F1";
const block2 = "026C";
const block3 = "02E7";
const block4 = "0362";

function initScreen() {
  const command1 = generateCommand(`${block1}${generateScreenCommandBody("在柜文件：0")}`);
  const command2 = generateCommand(`${block2}${generateScreenCommandBody("")}`);
  const command3 = generateCommand(`${block3}${generateScreenCommandBody("   " + config.user)}`);
  const command4 = generateCommand(`${block4}${generateScreenCommandBody("")}`);

  const commands = [command1, command2, command3, command4];
  console.log("🚀 - initScreen - commands:", commands);

  commands.forEach(command => {
    writeCommand(command);
  });
}

function updateRfidCount(count: number) {
  const commandBody = generateScreenCommandBody(count.toString().padStart(3, " "));
  const command = generateCommand(`${block1}${commandBody}`);
  writeCommand(command);
}

function updatePrompt(countdown: number) {
  const body = countdown === 0
    ? generateScreenCommandBody("")
    : generateScreenCommandBody(`  检测中-${countdown}`);

  const command = generateCommand(`${block4}${body}`);
  writeCommand(command);
}

eventEmitter.on("updateScreen", (count: number) => {
  updateRfidCount(count);
});

eventEmitter.on("updateCountdown", (countdown: number) => {
  logger.info("updateCountdown", countdown);
  updatePrompt(countdown);
});

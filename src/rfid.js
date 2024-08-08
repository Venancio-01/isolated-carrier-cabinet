const { SerialPort } = require('serialport')
const eventEmitter = require('./utils/emit');
const { MessageQueue } = require('./utils/util')
const logger = require('./utils/logger');
const { generateStartCommand, generateStopCommand, getTIDList } = require('rfid-utils')

const port = new SerialPort({
  path: '/dev/ttyS1',
  baudRate: 115200,
})

const messageQueue = new MessageQueue()

port.on('open', function() {
  logger.info('Rfid SerialPort Open')
  setTimeout(() => {
    startReading()
  }, 3000);
})

port.on('data', function(data) {
  const hexData = data.toString('hex')
  logger.info('Rfid Data:' + hexData)
  messageQueue.add(hexData)
})

function writeCommand(command) {
  port.write(command, (err) => {
    if (err) {
      console.error('Error writing to rfid serial port:', err)
    }

    logger.info('Command written to rfid serial port:' + command.toString('hex'))
  })
}

let countdown = 5
let timer = null

function startReading() {
  logger.info('Start reading RFID...')

  // 重置消息队列
  messageQueue.reset()
  const antennaIds = [1, 2, 3, 4]
  const startCommand = generateStartCommand(antennaIds)

  writeCommand(generateStopCommand())
  writeCommand(startCommand)

  countdown = 5;

  if (timer) clearInterval(timer)

  eventEmitter.emit('updateCountdown', countdown)
  timer = setInterval(() => {
    countdown--
    eventEmitter.emit('updateCountdown', countdown)

    if (countdown <= 0) {
      stopReading()
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

function stopReading() {
  writeCommand(generateStopCommand())
  getRfidTIDList()
}

function getRfidTIDList() {
  const data = messageQueue.getData()
  const TIDList = getTIDList(data)

  logger.info('检测到 Rfid TID 数量:' + TIDList.length)

  eventEmitter.emit('updateScreen', TIDList.length)
}

eventEmitter.on('startRfidReading', startReading)


function cleanup() {
  // 停止读取器读取
  const command = Buffer.from('5A000102FF0000885A', 'hex')
  writeCommand(command)
}

function handleExit(options, exitCode) {
  if (options.cleanup) cleanup();
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

// 当进程即将退出时
process.on('exit', (code) => {
  handleExit({ cleanup: true }, code);
});

// 捕捉 Ctrl+C 事件
process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting...');
  handleExit({ cleanup: true, exit: true });
});

// 捕捉终止信号
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Exiting...');
  handleExit({ cleanup: true, exit: true });
});

// 捕捉未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  handleExit({ cleanup: true, exit: true }, 1);
});


module.exports = {
  startReading
}

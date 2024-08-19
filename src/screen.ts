const { SerialPort } = require('serialport')
const eventEmitter = require('./utils/emit');
const { generateScreenCommandBody } = require('./utils/util');
const config = require('../config');
const logger = require('./utils/logger');

const port = new SerialPort({
  path: '/dev/ttyS2',
  baudRate: 115200,
})

port.on('open', function() {
  logger.info('Screen SerialPort Open')
  initScreen()
})

port.on('data', function(data) {
  logger.info('Screen Data:' + data.toString('hex'))
})

function writeCommand(command) {
  port.write(command, (err) => {
    if (err) {
      console.error('Error writing to screen serial port:', err)
    }

    logger.info('Command written to screen serial port:' + command.toString('hex'))
  })
}

function generateCommand(body) {
  const head = 'A55A';
  const prefix = '82';
  const end = 'FFFF';
  const len = ((head.length + prefix.length + end.length + body.length) / 2 - 2).toString(16).padStart(2, '0');

  const commandStr = `${head}${len}${prefix}${body}${end}`
  const buf = Buffer.from(commandStr, 'hex')

  return buf
}

const block1 = '01F1'
const block2 = '026C'
const block3 = '02E7'
const block4 = '0362'

function initScreen() {
  const command1 = generateCommand(`${block1}${generateScreenCommandBody('在柜文件：0')}`)
  const command2 = generateCommand(`${block2}${generateScreenCommandBody('')}`)
  const command3 = generateCommand(`${block3}${generateScreenCommandBody('   ' + config.user)}`)
  const command4 = generateCommand(`${block4}${generateScreenCommandBody('')}`)

  const commands = [command1, command2, command3, command4]
  console.log('🚀 - initScreen - commands:', commands)

  commands.forEach(command => {
    writeCommand(command)
  })
}


function updateRfidCount(count) {
  const command = generateCommand(`${block1}${generateScreenCommandBody(count.toString().padStart(3, ' '))}`)
  writeCommand(command)
}

function updatePrompt(countdown) {
  let body = null
  if (countdown === 0) {
    body = generateScreenCommandBody('')
  } else {
    body = generateScreenCommandBody('  检测中-' + countdown)
  }

  const command = generateCommand(`${block4}${body}`)
  writeCommand(command)
}

eventEmitter.on('updateScreen', (count) => {
  updateRfidCount(count)
})

eventEmitter.on('updateCountdown', (countdown) => {
  logger.info('updateCountdown', countdown)
  updatePrompt(countdown)
})

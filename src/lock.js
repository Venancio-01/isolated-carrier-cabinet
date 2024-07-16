const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');

const logger = require('./utils/logger');

const port = 17
let isOpen = false
let openDoorDebounceTimer = null;
let closeDoorDebounceTimer = null;
let prevState = null
let openDoorTriggered = false
let closeDoorTriggered = false

// 设置 pin 为上拉输入
const gpio = new Gpio({
  pin: port, mode: 'in', ready: () => {
    // gpio.cmd(`gpio mode ${port} down`).then(() => {
    setInterval(function() {
      gpio.read()
        .then((state) => {
          // if (prevState !== state) {
          logger.info('pin ' + port + ' 通电变化: ' + state);
          // }
          return

          // 开门
          if (state === '0') {
            if (closeDoorDebounceTimer) {
              clearTimeout(closeDoorDebounceTimer);
              closeDoorDebounceTimer = null;
            }

            if (openDoorTriggered) {
              return
            }

            openDoorDebounceTimer = setTimeout(() => {
              console.log('开门');
              isOpen = true
              openDoorTriggered = true
              closeDoorTriggered = false
              openDoorDebounceTimer = null;
            }, 1000)

          }
          // 关门
          else if (state === '1') {
            if (openDoorDebounceTimer) {
              clearTimeout(openDoorDebounceTimer);
              openDoorDebounceTimer = null;
            }

            if (closeDoorDebounceTimer || closeDoorTriggered) {
              return
            }

            closeDoorDebounceTimer = setTimeout(() => {
              console.log('关门');
              closeDoorDebounceTimer = null;

              // eventEmitter.emit('startRfidReading');
              closeDoorTriggered = true
            }, 1000);
          }

          prevState = state;
        });
    }, 500)
    // })
  }
});



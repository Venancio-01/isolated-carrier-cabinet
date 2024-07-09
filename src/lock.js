const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');
const logger = require('./utils/logger');

let isOpen = false
let openDoorDebounceTimer = null;
let closeDoorDebounceTimer = null;
let prevState = null
let triggered = false

// 设置 pin 19 为上拉输入
const gpio19 = new Gpio({
  pin: 19, mode: 'in', ready: () => {
    gpio19.cmd('gpio mode 19 up').then(() => {
      setInterval(function() {
        gpio19.read()
          .then((state) => {
            // if (prevState !== state) {
            logger.info('pin 19 通电变化: ' + state);
            // }

            // 开门
            if (state === '0') {
              if (closeDoorDebounceTimer) {
                clearTimeout(closeDoorDebounceTimer);
                closeDoorDebounceTimer = null;
              }

              openDoorDebounceTimer = setTimeout(() => {
                console.log('开门');
                isOpen = true
                triggered = false
                openDoorDebounceTimer = null;
              }, 1000)

            }
            // 关门
            else if (state === '1') {
              if (openDoorDebounceTimer) {
                clearTimeout(openDoorDebounceTimer);
                openDoorDebounceTimer = null;
              }

              if (closeDoorDebounceTimer || triggered) {
                return
              }

              closeDoorDebounceTimer = setTimeout(() => {
                console.log('关门');
                logger.info('level changed');
                closeDoorDebounceTimer = null;

                eventEmitter.emit('startRfidReading');
                triggered = true
              }, 1000);
            }

            prevState = state;
          });
      }, 200)
    })
  }
});



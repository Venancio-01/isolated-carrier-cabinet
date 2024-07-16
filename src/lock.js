const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');

const logger = require('./utils/logger');

const port = 17
let closeDoorDebounceTimer = null;
let prevState = null
let triggered = false

const gpio = new Gpio({
  pin: port, mode: 'in', ready: () => {
    setInterval(function() {
      gpio.read()
        .then((state) => {
          // if (prevState !== state) {
            logger.info('pin ' + port + ' 通电变化: ' + state);
          // }
          return

          // 开门
          if (state === '0') {
            console.log('开门');
            isOpen = true
            triggered = false
          }
          // 关门
          else if (state === '1') {
            if (closeDoorDebounceTimer || triggered) {
              return
            }

            closeDoorDebounceTimer = setTimeout(() => {
              console.log('关门');
              closeDoorDebounceTimer = null;

              eventEmitter.emit('startRfidReading');
              triggered = true
            }, 1000);
          }

          prevState = state;
        });
    }, 500)
  }
});



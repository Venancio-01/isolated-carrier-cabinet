const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');
const logger = require('./utils/logger');

let debounceTimer = null;
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
              if (debounceTimer) {
                clearTimeout(debounceTimer);
                debounceTimer = null;
              }
            }
            // 关门
            else if (state === '1') {
              if (debounceTimer || triggered) {
                return
              }

              debounceTimer = setTimeout(() => {
                logger.info('level changed');
                debounceTimer = null;

                eventEmitter.emit('startRfidReading');
                triggered = true
              }, 1000);

              triggered = false
            }

            prevState = state;
          });
      }, 200)
    })
  }
});



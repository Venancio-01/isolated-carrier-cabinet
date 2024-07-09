const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');
const logger = require('./utils/logger');

let debounceTimer = null;
let prevState = null
let triggered = false

const gpio19 = new Gpio({
  pin: 19, mode: 'in', ready: () => {
    gpio19.cmd('gpio mode 19 up').then(() => {
      setInterval(function() {
        gpio19.read()
          .then((state) => {
            // if (prevState !== state) {
              logger.info('pin 19 通电变化: ' + state);
            // }

            // 通电 - 开门
            // if (state === '1') {
            //   if (debounceTimer) {
            //     clearTimeout(debounceTimer);
            //     debounceTimer = null;
            //   }
            // }
            // // 断电 - 关门
            // else if (state === '0') {
            //   if (debounceTimer || triggered) {
            //     return
            //   }

            //   debounceTimer = setTimeout(() => {
            //     logger.info('level changed');
            //     debounceTimer = null;

            //     eventEmitter.emit('startRfidReading');
            //     triggered = true
            //   }, 2000);

            //   triggered = false
            // }

            // prevState = state;
          });
      }, 500)
    })
  }
});



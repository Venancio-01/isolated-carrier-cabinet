const Gpio = require('orange-pi-gpio');
const eventEmitter = require('./utils/emit');

const logger = require('./utils/logger');

const port = 20
let prevState = null
let triggered = false

const gpio = new Gpio({
  pin: port, mode: 'in', ready: async () => {
    prevState = await gpio.read()
    console.log('🚀 - pin:port,mode:ready: - prevState:', prevState)
    setInterval(function() {
      gpio.read()
        .then((state) => {
          if (prevState !== state) {
            logger.info('pin ' + port + ' 通电变化: ' + state);
          }

          // 开门
          if (state === '0') {
            console.log('开门');
            triggered = false
          }
          // 关门
          else if (state === '1') {
            console.log('关门');

            if (triggered) return
            eventEmitter.emit('startRfidReading');
            triggered = true
          }

          prevState = state;
        });
    }, 500)
  }
});



const Gpio = require('onoff').Gpio;
const debounce = require('lodash.debounce');
const eventEmitter = require('./utils/emit');
const doorSensor = new Gpio(7, 'in', 'both', { debounceTimeout: 200 });
// 已经触发过的
let triggered = false
let timer = null

function watch(fn) {
  let prevValue = doorSensor.readSync();
  setInterval(() => {
    const currentValue = doorSensor.readSync();
    console.log('🚀 - setInterval - currentValue:', currentValue)
    if (prevValue !== currentValue) {
      fn();
      prevValue = currentValue;
    }
  }, 300);
}

function handleGPIOChange() {
  const currentValue = doorSensor.readSync();
  if (currentValue === 0) {
    // console.log('门已打开');
    triggered = false
    clearTimeout(timer)
    timer = null
  } else if (currentValue === 1) {
    if (triggered) return

    timer = setTimeout(() => {
      console.log('门已关闭');
      eventEmitter.emit('startRfidReading');
      timer = null
    }, 1000);
  }
}

watch(handleGPIOChange);


// doorSensor.watch((err, value) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('🚀 - doorSensor.watch - value:', value)
//   }
// })


function unExport() {
  doorSensor.unexport();
}

module.exports = {
  unExport
}

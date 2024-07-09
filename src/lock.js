const Gpio = require('onoff').Gpio;
const debounce = require('lodash.debounce');
const eventEmitter = require('./utils/emit');
const doorSensor = new Gpio(7, 'in', 'both', { debounceTimeout: 200 });
// 已经触发过的
let triggered = false

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


const debouncedGPIOChange = debounce(function handleGPIOChange() {
  const currentValue = doorSensor.readSync();
  if (currentValue === 0) {
    console.log('门已打开');
    triggered = false
  } else if (currentValue === 1) {
    if (triggered) return
    console.log('门已关闭');
    eventEmitter.emit('startRfidReading');
  }
}, 1500)


watch(debouncedGPIOChange);


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

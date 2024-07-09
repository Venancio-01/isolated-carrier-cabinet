const Gpio = require('onoff').Gpio;
const debounce = require('lodash.debounce');
const doorSensor = new Gpio(7, 'in', 'falling', { debounceTimeout: 100 }); // 使用上拉电阻，防抖时间为 50 毫秒

function watch(fn) {
  let prevValue = doorSensor.readSync();
  setInterval(() => {
    const currentValue = doorSensor.readSync();
    console.log('🚀 - setInterval - currentValue:', currentValue)
    if (prevValue !== currentValue) {
      fn();
      prevValue = currentValue;
    }
  }, 200);
}


const debouncedGPIOChange = debounce(function handleGPIOChange() {
  const currentValue = doorSensor.readSync();
  if (currentValue === 0) {
    console.log('门已打开');
  } else if (currentValue === 1) {
    console.log('门已关闭');
  }
}, 1000)


watch(debouncedGPIOChange);


function unExport() {
  doorSensor.unexport();
}

module.exports = {
  unExport
}

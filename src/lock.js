const Gpio = require('onoff').Gpio;
const doorSensor = new Gpio(7, 'in', 'falling', { debounceTimeout: 100 }); // 使用上拉电阻，防抖时间为 50 毫秒

setInterval(() => {
  const currentValue = doorSensor.readSync();
  console.log('🚀 - setInterval - currentValue:', currentValue)
}, 500);



function unExport() {
  doorSensor.unexport();
}

module.exports = {
  unExport
}

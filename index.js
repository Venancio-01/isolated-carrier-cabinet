// require('./src/lock')
// require('./src/screen')
// require('./src/rfid')
// require('./src/utils/logger')


const Gpio = require('onoff').Gpio;
const doorSensor = new Gpio(7, 'in', 'falling', { debounceTimeout: 100 }); // 使用上拉电阻，防抖时间为 50 毫秒

console.log('开始监听传感器状态变化...');
console.log(Gpio.accessible, 'Gpio.accessible');

// 处理传感器状态变化的回调函数
doorSensor.watch((err, value) => {
  if (err) {
    console.error('发生错误:', err);
    return;
  }

  console.log('🚀 - doorSensor.watch - value:', value)
  console.log(doorSensor.edge(), 'doorSensor.edge()');
  console.log(doorSensor.direction(), 'doorSensor.direction()');

  if (value === Gpio.HIGH) {
    console.log('门是关的');
  } else {
    console.log('门是开的');
  }
});

// 定时读取传感器状态用于调试
setInterval(() => {
  const currentValue = doorSensor.readSync();
  console.log('当前传感器状态:', currentValue);
}, 1000);

process.on('SIGINT', () => {
  doorSensor.unexport(); // 清理 GPIO 资源
  process.exit();
});

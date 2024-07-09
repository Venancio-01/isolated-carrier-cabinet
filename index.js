// require('./src/lock')
// require('./src/screen')
// require('./src/rfid')
// require('./src/utils/logger')


const Gpio = require('onoff').Gpio;
const doorSensor = new Gpio(7, 'in', 'both', { debounceTimeout: 50 }); // 使用上拉电阻，防抖时间为 50 毫秒

console.log('开始监听传感器状态变化...');


setInterval(() => {
  console.log('doorSensor.readSync():', doorSensor.readSync());
}, 1000);

// 处理传感器状态变化的回调函数
doorSensor.watch((err, value) => {
  if (err) {
    console.error('发生错误:', err);
    return;
  }

  console.log('🚀 - doorSensor.watch - value:', value)

  if (value === 1) {
    console.log('门是关的');
  } else {
    console.log('门是开的');
  }
});

process.on('SIGINT', () => {
  doorSensor.unexport(); // 清理 GPIO 资源
  process.exit();
});

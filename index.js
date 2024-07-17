require('./src/lock')
require('./src/screen')
require('./src/screen')
require('./src/rfid')
require('./src/utils/logger')


process.on('SIGINT', () => {
  // unExport()
  process.exit();
});

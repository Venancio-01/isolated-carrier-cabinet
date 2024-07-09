const pino = require('pino');

const logger = pino({
  transport: {
    target: 'pino-pretty',
    destination: 'app.log'
  },
});

module.exports = logger

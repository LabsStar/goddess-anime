const pino = require('pino');
const logger = pino({
    prettyPrint: {
        colorize: true,
        translateTime: true,
    },
});

export default logger;
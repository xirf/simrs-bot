import pino from 'pino';

const log = pino({
    level: process.env.production ? 'warn' : 'debug',
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            levelFirst: true,
            ignore: 'pid,hostname',
            hideObject: process.env.production,

        }
    }
})

export default log;
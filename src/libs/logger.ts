import pino from 'pino'

const logger = pino({
    level: "",
    transport: {
        target: "pino-pretty",
    },
})


export default logger
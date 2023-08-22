import cron from 'node-cron';
import birthday from './birthday';
import client from '../whatsapp/client';
import pino from "../logger"

export default () => {
    pino.info("Starting CronJob task!")
    cron.schedule('*/5 * * * * *', () => {  // At 1 seconds past the minute, every minute, every hour, every day
        birthday(client)
    });
}


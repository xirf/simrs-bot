import cron from 'node-cron';
import birthday from './birthday';
import client from '../whatsapp/client';
import pino from "../logger"
import konsul from './konsul';

export default () => {
    pino.info("Starting CronJob task!")
    cron.schedule('*/30 * * * * *', () => {  // Every 30 seconds, every minute, every hour, every day
        // birthday()
        konsul()
    });
}

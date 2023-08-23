import cron from 'node-cron';
import birthday from './birthday';
import client from '../whatsapp/client';
import pino from "../logger"
import konsul from './konsul';

export default () => {
    pino.info("Starting CronJob task!")
    cron.schedule('*/30 * * * * *', () => {  // Every second, every minute, between 07:00 and 07:59, every day
        birthday()
        // konsul()
    });
}

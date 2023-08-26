import cron from 'node-cron';
import birthday from './birthday';
import pino from "../logger"
import konsul from './konsul';

export default () => {
    pino.info("Starting CronJob task")
    cron.schedule('* * 7 * * *', () => { 
        pino.info("Running CronJob task")
        birthday()
        konsul()
    });
}

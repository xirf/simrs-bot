import { AnyMessageContent } from '@whiskeysockets/baileys';
import cron from 'node-cron';
import log from '../../../../utils/logger';


class Reminder {
    private reminders: Map<string, cron.ScheduledTask>;

    constructor() {
        this.reminders = new Map();
    }

    addReminder(cronExpression: string, msg: AnyMessageContent, recipient: string): void {

        log.info(`Adding reminder for ${recipient} with cron expression ${cronExpression}`);
        let taskName = `reminder_${recipient}_${this.reminders.size + 1}`;

        // Schedule task
        let task = cron.schedule(cronExpression, () => {
            if (global.sock) {
                global.sock.sendMessage(recipient, msg);
            }

            this.removeReminder(taskName);
            this.reminders.delete(taskName);
        });

        this.reminders.set(taskName, task);
    }

    removeReminder(reminderName: string): void {
        const reminder = this.reminders.get(reminderName);
        if (reminder) {
            reminder.stop();
            this.reminders.delete(reminderName);
            console.log(`Reminder "${reminderName}" removed.`);
        } else {
            console.log(`Reminder "${reminderName}" does not exist.`);
        }
    }
}

export default new Reminder();

import cron from "node-cron";
import log from "./logger";


interface TaskType {
    name: string;   
    task: () => void;
    cronExpression: string;
    cronJob: any;
}

class Task {
    protected tasks: any[];

	constructor() {
		this.tasks = [];
    }
    
    addTask(name: string, task: () => void, cronExpression: string) {
        
        if (!cron.validate(cronExpression)) {
            throw new Error("Invalid cron expression");
        }

		const taskObj: any = {
			name,
			task,
			cronExpression,
			cronJob: null,
		};
		this.tasks.push(taskObj);
		this.startTask(taskObj);
    }
    
	startTask(taskObj: TaskType) {
		taskObj.cronJob = cron.schedule(taskObj.cronExpression, async () => {
			try {
				await taskObj.task();
				this.deleteTask(taskObj);
			} catch (error) {
				log.error(error);
			}
		});
    }
    
	deleteTask(taskObj: TaskType) {
		taskObj.cronJob.stop();
		delete taskObj.cronJob;
		this.tasks = this.tasks.filter((task) => task.name !== taskObj.name);
	}
}

export default new Task();
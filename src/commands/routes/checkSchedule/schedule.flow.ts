import { ConversationFlow } from "../../../types/Command";
import getName from "./getName";
import showDoctor from "./showDoctor";



const scheduleFlow: ConversationFlow = {
    "schedule.selectSchedule": {
        handler: getName.handler,
        awaitResponse: async (_) => 1,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "schedule.showDoctor",
            },
        ]
    },
    "schedule.showDoctor": {
        handler: showDoctor.handler,
        awaitResponse: showDoctor.parseResponse,
        transitions: [
            {
                condition: (res) => res == "retry",
                nextRoute: "schedule.showDoctor",
            },
            {
                condition: (res) => res == "next",
                nextRoute: "schedule.showSchedules",
            }
        ]
    },
    
}


export default scheduleFlow
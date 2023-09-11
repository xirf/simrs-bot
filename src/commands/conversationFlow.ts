import welcomeMessage from "./welcome.js";
import type { ConversationFlow } from "../types/Command.d.ts";
import regFlow from "./routes/regist/reg.flow.js";

const conversationFlow: ConversationFlow = {
    "msg.welcome": {
        handler: welcomeMessage.handler,
        awaitResponse: welcomeMessage.parseResponse,
        transitions: [
            {
                condition: (num) => num === 1,
                nextRoute: "reg.selectRegtype",
            },
        ]
    },
    "end": {
        handler: async () => { return ({ text: "Terima kasih sudah selesai" }) },
    },
    // spread the object to extract its properties
    ...regFlow,

};

export default conversationFlow
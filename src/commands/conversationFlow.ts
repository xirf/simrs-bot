import welcomeMessage from "./welcome.js";
import selectRegtype from "./regist/selectRegtype.js";
import type { ConversationFlow } from "../types/Command.d.ts";
import regBPJS from "./regist/regBPJS.js";
import regUmum from "./regist/regUmum.js";

const conversationFlow: ConversationFlow = {
    "msg.welcome": {
        handler: welcomeMessage.handler,
        awaitResponse: welcomeMessage.parseResponse,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "reg.selectRegtype",
            },
        ]
    },
    "reg.selectRegtype": {
        handler: selectRegtype.handler,
        awaitResponse: selectRegtype.parseResponse,
        transitions: [
            {
                condition: (resp) => resp == 1,
                nextRoute: "req.umum",
            },
            {
                condition: (resp) => resp == 2,
                nextRoute: "req.bpjs",
            },
        ]
    },
    "req.umum": {
        handler: regUmum.handler,
    },
    "req.bpjs": {
        handler: regBPJS.handler,
    },
    "end": {
        handler: async () => { return ({ text: "Terima kasih sudah selesai" }) },
    }

};

export default conversationFlow
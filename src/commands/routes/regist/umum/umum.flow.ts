import { ConversationFlow } from "../../../../types/Command";
import regUmum from "./regUmum";


const umumFlow: ConversationFlow = {
    "req.umum": {
        handler: regUmum.handler,
        awaitResponse: regUmum.parseResponse,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "reg.input.poli"
            }
        ]
    },
}

export default umumFlow
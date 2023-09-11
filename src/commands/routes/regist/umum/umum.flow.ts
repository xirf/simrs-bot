import { ConversationFlow } from "../../../../types/Command";
import regUmum from "./regUmum";
import selectDokter from "./selectDokter";
import selectJadwal from "./selectJadwal";
import selectPoli from "./selectPoli";


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
    "reg.input.poli": {
        handler: selectPoli.handler,
        awaitResponse: selectPoli.parseResponse,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "reg.input.dokter"
            }
        ]
    },
    "reg.input.dokter": {
        handler: selectDokter.handler,
        awaitResponse: selectDokter.parseResponse,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "reg.input.jadwal"
            }
        ]
    },
    "reg.input.jadwal": {
        handler: selectJadwal.handler,
        awaitResponse: selectJadwal.parseResponse,
        transitions: [
            {
                condition: (_) => true,
                nextRoute: "reg.input.confirm"
            }
        ]
    },
    "reg.input.confirm": {
        handler: async (_) => { return ({ text: "ok" }) },

    }
}

export default umumFlow

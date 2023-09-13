import db from "../../../db/client";
import config from "../../../config";
import extractMessage from "../../../utils/extract";
import { AnyMessageContent } from "@whiskeysockets/baileys";
import state from "../../../utils/state";
import log from "../../../utils/logger";


async function handler(msg): Promise<AnyMessageContent> {
    try {
        let { sender } = await extractMessage(msg);
        let userState = await state.get(`data_${sender}`) ?? {};

        let query = `SELECT template from public.${config.tables.template} WHERE name='schedule.getname'`;
        let template = await db.query(query);

        // just for initial data
        await state.update(`data_${sender}`, userState);

        return ({
            text: template.rows[ 0 ].template,
        })

    } catch (error) {
        log.error(error);
        return ({
            text: "Terjadi kesalahan, \n\nJangan Khawatir kami sudah melaporkan masalah ini ke admin",
        });
    }
}

export default {
    handler
}
import db from "@/db";
import type { Reply } from "@/types/Client.d.ts";
import log from "@/utils/logger";
import extractMessage from "@/utils/extract";

const welcomeMessage: Reply = async function welcomeMessage(msg, jid) {
    return new Promise(async (resolve, reject) => {
        try {
            const { sender, pushName, text } = await extractMessage(msg);
            const query = 'SELECT * FROM global_state WHERE key = $1';

        } catch (error) {
            log.error(error)
            reject(error)
        }
    })
}

export default welcomeMessage
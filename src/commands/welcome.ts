import db from "../db/client";
import log from "../utils/logger";
import extractMessage from "../utils/extract";
import parseTemplate from "../utils/parseTemplate";
import { AnyMessageContent, WAMessage, toNumber } from "@whiskeysockets/baileys";
import config from "../config";
import formatDate from "../utils/formatDate";


function handler(msg: WAMessage): Promise<AnyMessageContent> {
    return new Promise(async (resolve, reject) => {
        try {
            const { pushName, phoneNumber } = await extractMessage(msg);


            const query = `SELECT p.nama, b.tgl_kontrol
            FROM pasien p
            INNER JOIN booking b ON p.no_rm = b.no_rm
            WHERE RIGHT(p.telepon, 10) = RIGHT($1, 10)
              AND b.tgl_kontrol >= $2
            ORDER BY b.tgl_kontrol DESC
            LIMIT 1; 
            `;
            const result = await db.query(query, [
                phoneNumber, new Date().toISOString().split('T')[ 0 ]
            ]);


            let templateQuery = `
            SELECT "template" from "public".${config.tables.template} 
            WHERE "name"='msg.welcome'
            `;
            const templateMsg = await db.query(templateQuery);


            // parse the template this will replace pattern [name] using name
            // if kontrol is available it will also replaced
            let message = parseTemplate(templateMsg.rows[ 0 ].template, {
                name: result.rows[ 0 ]?.nama ?? pushName,
                kontrol: result.rows[ 0 ]?.tgl_kontrol,
                time: formatDate((new Date()).toISOString())
            });

            // return the message
            resolve({ text: message });

        } catch (error) {
            log.error(error)
            reject(error)
        }
    })
}

async function parseResponse(msg: WAMessage): Promise<number> {
    let { text } = await extractMessage(msg);

    // get first number from the text
    return toNumber(text.replace(/\D/g, ''))
}

export default {
    handler,
    parseResponse
}
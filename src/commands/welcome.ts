import db from "../db/client";
import log from "../utils/logger";
import extractMessage from "../utils/extract";
import parseTemplate from "../utils/parseTemplate";
import { WAMessage } from "@whiskeysockets/baileys";

function welcomeMessage(msg: WAMessage): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const { sender, pushName, phoneNumber } = await extractMessage(msg);
            const query = `SELECT p.nama, b.tgl_kontrol
            FROM pasien p
            INNER JOIN booking b ON p.no_rm = b.no_rm
            WHERE RIGHT(p.telepon, 10) = RIGHT($1, 10)
              AND b.tgl_kontrol >= $2; 
            ORDER BY b.tgl_kontrol DESC
            LIMIT 1; 
            `;
            const result = await db.query(query, [
                phoneNumber, new Date().toISOString().split('T')[ 0 ]
            ]);

            let templateQuery = `select template from ${process.env.TBL_TEMPLATE} where name = 'msg.welcome'`;
            const templateMsg = await db.query(templateQuery);

            let message = parseTemplate(templateMsg.rows[ 0 ].template, {
                nama: result.rows[ 0 ].nama || pushName,
                tgl_kontrol: result.rows[ 0 ].tgl_kontrol
            });

            
            global.sock.sendMessage(sender, { text: message })

            if (!result.rows.length) {
                resolve();
                return;
            }

        } catch (error) {
            log.error(error)
            reject(error)
        }
    })
}

export default welcomeMessage
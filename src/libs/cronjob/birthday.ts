import DB from "../../db/database";
import pino from "../logger"
import fs from "fs"
import client from "../whatsapp/client";
import cardParser from "../../utils/cardParser";

export default async () => {
    return new Promise(async (res, rej) => {
        try {

            const today = new Date();
            const todayMonth = today.getMonth() + 1;
            const todayDate = today.getDate();

            const birthdayMessages = await DB.query(`SELECT * FROM "public"."kegiatan" WHERE ucapan_ultah IS NOT NULL ORDER BY "last_updated" LIMIT 1`)
            const pasiens = await DB.query(
                `SELECT telepon, nama FROM "public"."pasien" WHERE EXTRACT(MONTH FROM tgl_lahir) = $1 AND EXTRACT(DAY FROM tgl_lahir) = $2`,
                [ todayMonth, todayDate ]
            );

            pino.info("Sending birthday card to " + pasiens.rows.length + " receipient")
            pasiens.rows.forEach(async (p) => {
                if (p.telepon && p.telepon.length > 8) {
                    let [ result ] = await client.onWhatsapp(p.telepon)
                    if (result.exists) {
                        let tel = result.jid

                        let msg = cardParser(birthdayMessages.rows[ 0 ].ucapan_ultah, {
                            nama: p.nama
                        })

                        try {
                            if (birthdayMessages.rows[ 0 ].kartu_ultah) {
                                await client.sendImage(tel, { url: birthdayMessages.rows[ 0 ].kartu_ultah }, msg);
                            } else {
                                await client.sendMessage(tel, msg);
                            }

                            pino.info("Succesfully Send Birthday message to " + p.nama)

                        } catch (error) {

                            pino.warn("Failed to send birthday card to " + p.nama)
                            pino.warn(error)

                        }

                    } else {

                        pino.warn(`User ${p.nama} don't have whatsapp account`)

                    }
                }
            });

            res("Done")
        } catch (error) {
            rej(error)
        }
    })
}

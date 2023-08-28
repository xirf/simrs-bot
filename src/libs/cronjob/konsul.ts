import cardParser from "../../utils/cardParser";
import DB from "../../db/database";
import pino from "../logger"
import client from "../whatsapp/client";
import { QueryResult } from "pg"

function formatDate(date: Date): string {
    const days = [ 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu' ];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli',
        'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayOfWeek = days[ date.getDay() ];
    const dayOfMonth = date.getDate();
    const month = months[ date.getMonth() ];

    return `${dayOfWeek}, ${dayOfMonth} ${month}`;
}

export default async () => {
    return new Promise(async (res, rej) => {
        try {
            const konsulMessage = await DB.query(`SELECT * FROM "public"."kegiatan" WHERE pengingat_konsul IS NOT NULL ORDER BY "last_updated" LIMIT 1`)
            const pasiens: QueryResult<any> = await DB.query(`SELECT b.tgl_kontrol, jj.jam_mulai, u.nama_unit, p.nama, p.telepon FROM "public"."booking" AS b INNER JOIN "public"."jadwal_jam" AS jj ON b.id_jam = jj.id_jam INNER JOIN "public"."unit" AS u ON b.id_unit = u.id_unit INNER JOIN "public"."pasien" AS p ON b.no_rm = p.no_rm WHERE b.tgl_kontrol = CURRENT_DATE + INTERVAL '1 day'`);

            pino.info("Sending Consul Notifiication to " + pasiens.rows.length + " receipient")

            pasiens.rows.forEach(async (p) => {
                if (p.telepon && p.telepon.length > 8) {
                    let [ result ] = await client.onWhatsapp(p.telepon)
                    if (result.exists) {
                        let tel = result.jid

                        try {
                            let message = cardParser(konsulMessage.rows[ 0 ].pengingat_konsul, {
                                nama: p.nama,
                                tgl: formatDate(p.tgl_kontrol),
                                jam: p.jam_mulai.substring(0, 5),
                                poli: p.nama_unit,
                            })

                            await client.sendMessage(tel, { text: message });
                            pino.info("Succesfully Consul notification message to " + p.nama)
                        } catch (error) {
                            pino.error("Failed to send Consul notification to " + p.nama)
                            pino.error(error)

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

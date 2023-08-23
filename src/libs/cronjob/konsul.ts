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


            const pasiens: QueryResult<any> = await DB.query(`SELECT b.tgl_kontrol, jj.jam_mulai, u.nama_unit, p.nama, p.telepon FROM "public"."booking" AS b INNER JOIN "public"."jadwal_jam" AS jj ON b.id_jam = jj.id_jam INNER JOIN "public"."unit" AS u ON b.id_unit = u.id_unit INNER JOIN "public"."pasien" AS p ON b.no_rm = p.no_rm WHERE b.tgl_kontrol = CURRENT_DATE + INTERVAL '1 day'`);

            pino.info("Sending Consul Notifiication to " + pasiens.rows.length + " receipient")

            pasiens.rows.forEach(async (p) => {
                if (p.telepon && p.telepon.length > 8) {
                    let [ result ] = await client.onWhatsapp(p.telepon)
                    if (result.exists) {
                        let tel = result.jid

                        try {

                            let message = `Selamat pagi _*${p.nama}*_, \n\nKami dari *RSU Darmayu* ingin mengingatkan Anda tentang janji konsultasi medis Anda yang akan datang besuk pada:\n\nTanggal\t: ${formatDate(p.tgl_kontrol)}\nJam\t\t\t\t: *${(p.jam_mulai).substring(0, 5)}*\nLokasi\t\t: *Poli ${p.nama_unit}*, RSU Darmayu\n\nKami sarankan Anda tiba tepat waktu, sekitar 15 - 30 menit sebelum janji konsultasi Anda, karena ini akan membantu kami memberikan pelayanan terbaik dan memastikan Anda mendapatkan apa yang Anda butuhkan. \n\nJangan ragu untuk menghubungi kami di nomor ini, tim medis kami siap membantu Anda jika Anda memiliki pertanyaan atau perlu mengubah jadwal. \n\nTerima kasih atas kepercayaan Anda pada kami untuk merawat kesehatan Anda. Kami berharap Anda baik-baik saja dan siap untuk konsultasi medis Anda. \n\nSalam hangat\nTenaga Medis RSU Darmayu`


                            await client.sendMessage(tel, message);
                            pino.info("Succesfully Send Birthday message to " + p.nama)
                        } catch (error) {
                            pino.error("Failed to send birthday card to " + p.nama, error)
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

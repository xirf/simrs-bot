import DB from "../../db/database";
import { parser } from "../messageParser"
import client from "../../libs/whatsapp/client";
import { QueryResult } from 'pg'
import fs from "fs"

export const hello = async (message): Promise<void> => {
    const { sender, pushName, text }: { sender: string, pushName: string, text: string } = await parser(message);
    if (sender) {

        const lastMessageQuery: QueryResult<any> = await DB.query(`SELECT "last_message" FROM "public"."whatsapp" WHERE "number" = '${sender}';`)
        const lastMessage = lastMessageQuery.rows

        if (!lastMessage ||
            lastMessage.length < 1 ||
            (
                new Date(lastMessage[ 0 ].last_message).toLocaleDateString() < new Date().toLocaleDateString()
            )
        ) {

            await client.sendMessage(sender, {
                text: `
Halo ${pushName}, selamat datang. apakah ada yang bisa kami bantu?.

Silahkan pilih layanan yang anda inginkan:
1. Daftar Pasien Baru
2. Booking Jadwal
3. Cek Jadwal
4. Cek Antrian

Silahkan ketik angka yang sesuai dengan layanan yang anda inginkan 😊.
`})
        }

        await DB.query(` INSERT INTO "public"."whatsapp" (number, last_message) VALUES ($1, $2) ON CONFLICT (number) DO UPDATE SET last_message = EXCLUDED.last_message;`, [ sender, (new Date()) ]).then(console.info).catch(console.error)

    };
    return;
}
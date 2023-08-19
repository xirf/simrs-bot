import { DB, parseResult } from "../../db/database";
import { parser } from "../messageParser"
import client from "../whatsapp/client";
import { QueryResult } from 'pg'

export const hello = async (message): Promise<void> => {
    const { sender, pushName, text }: { sender: string, pushName: string, text: string } = await parser(message);
    if (sender) {

        const lastMessageQuery: QueryResult<any> = await DB.query(`SELECT "last_message" FROM "public"."whatsapp" WHERE "number" = '${sender}';`)

        const lastMessage = await parseResult(lastMessageQuery)
        console.log(lastMessage);

        if (!lastMessage || lastMessage.length < 1 || ((new Date(lastMessage[ 0 ].last_message)) < (new Date()))) {
            await client.sendMessage(sender, `Halo ${pushName}, selamat datang. apakah ada yang bisa kami bantu?.`)
        }

        await DB.query(` INSERT INTO "public"."whatsapp" (number, last_message) VALUES ($1, $2) ON CONFLICT (number) DO UPDATE SET last_message = EXCLUDED.last_message;`, [ sender, (new Date()) ]).then(console.info).catch(console.error)
        // } else {
        //     return
        // }
    };
    return;
}
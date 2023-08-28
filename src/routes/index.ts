import { AnyMessageContent } from "@whiskeysockets/baileys"
import DB from "../db/database"
import { parser } from "../libs/messageParser"
import getTime from "../utils/getTime"
import cekAntrian from "./cekAntrian"

import type { BeforeSendParams, RoutesType } from "../types/routes.d.ts"


async function beforeSend({ messageText, fullMessage, collection, nextRoutes }: BeforeSendParams): Promise<AnyMessageContent | null> {
    let text: string

    const { sender, pushName }: { sender: string, pushName: string, text: string } = await parser(fullMessage);


    const lastMessageQuery = await DB.query(`SELECT "last_message" FROM "public"."whatsapp" WHERE "number" = '${sender}';`)
    const lastMessage = lastMessageQuery.rows

    if (!lastMessage || lastMessage.length < 1 || (new Date(lastMessage[ 0 ].last_message).toLocaleDateString() < new Date().toLocaleDateString())) {

        let choices = nextRoutes.map((val, index) => {
            return `${index + 1}. ${val.name}`
        }).join("\n")

        text = messageText.replace("{{user}}", pushName).replace("{{time}}", getTime()).replace("{{routes}}", choices)

        return { text }
    } else {
        return null
    }
}

const routes: RoutesType = {
    id: "root",
    name: "Selamat datang",
    messageText: "Halo {{user}}, selamat {{time}}. apakah ada yang bisa saya bantu?\n\n{{routes}}\n\nSilahkan ketik angka yang sesuai dengan layanan yang anda inginkan 😊.",
    collect: [ "nextRoutes" ],
    beforeSend: beforeSend,
    next: [
        cekAntrian
    ]
}

export default routes
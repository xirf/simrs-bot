import { proto } from "@whiskeysockets/baileys"
import type { Reply } from "../types/Client.d.ts"

export default async function handler(msg: proto.IWebMessageInfo, reply: Reply): Promise<void> {
    console.log('recv msg', msg)
    reply
}
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import client from "./whatsapp/client";
import { writeFileSync } from 'fs'
export interface ParsedMessage {
    sender: string;
    pushName: string;
    image: Buffer | any;
    video: Buffer | any;
    text: string;
}

export const parser = async (message): Promise<ParsedMessage> => {
    try {


        const m = message.message

        const sender = message?.key?.remoteJid;
        const pushName = message?.pushName;

        let image = null;
        let video = null;

        if (Object.keys(m)[ 0 ] == 'imageMessage') {
            image = await downloadMediaMessage(m, 'buffer', {}, null);
        } else if (Object.keys(m)[ 0 ] == 'videoMessage') {
            video = await downloadMediaMessage(m, 'buffer', {}, null);
        }

        const text = m.conversation || m.caption || m.extendedTextMessage?.text || "no messages";
        console.log(text)
        return {
            sender,
            pushName,
            image,
            video,
            text
        }
    } catch (error) {

    }
}
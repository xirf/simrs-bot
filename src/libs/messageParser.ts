import { downloadMediaMessage } from "@whiskeysockets/baileys";
import client from "./whatsapp/client";

export interface ParsedMessage {
    sender: string;
    pushName: string;
    image: Buffer | any;
    video: Buffer | any;
    text: string;
}

export const parser = async (message): Promise<ParsedMessage> => {
    const m = message.message

    const sender = message?.key?.remoteJid;
    const pushName = message?.pushName;

    const image = await downloadMediaMessage(message, 'buffer', {}, null) || null;
    const video = await downloadMediaMessage(message, 'buffer', {}, null) || null;
    const text = m.conversation || m.caption || m.extendedTextMessage?.text

    return {
        sender,
        pushName,
        image,
        video,
        text
    }
}
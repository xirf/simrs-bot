import { parser } from "../messageParser"
import client from "../whatsapp/client";

export const hello = async (message) => {
    const { sender, pushName, text } = await parser(message[ 0 ]);
    client.sendMessage(sender, '---- TEST ----');
}
import { parser } from "../messageParser"
import client from "../whatsapp/client";

export const hello = async (message) => {
    const { sender, pushName, text } = await parser(message);
    if (sender) {
        client.sendMessage(sender, text);
    };
    return;
}
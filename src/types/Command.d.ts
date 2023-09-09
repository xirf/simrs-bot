import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";

interface ConversationRoute {
    handler: (msg: WAMessage) => Promise<AnyMessageContent>;
    awaitResponse?: (msg: WAMessage) => Promise<String | number | "batal" | "invalid" | any>;
    transitions?: {
        condition: (resp: String | number | any) => boolean;
        nextRoute: string;
    }[];
}

type ConversationFlow = Record<string, ConversationRoute>;
import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";

declare type RoutesType = {
    id: string | number;
    name: string;
    messageText: string;
    collect: any[];
    beforeCollect?: beforeCollect;
    beforeSend?: BeforeSend;
    next?: RoutesType[];
}

interface BeforeSendParams {
    messageText: string;
    fullMessage: WAMessage;
    collection: any[];
    nextRoutes: RoutesType[]
}

declare type BeforeSend = ({ messageText, fullMessage, collection, nextRoutes }: BeforeSendParams) => Promise<AnyMessageContent | null>

declare type beforeCollect = (message: string) => Promise<any[]>
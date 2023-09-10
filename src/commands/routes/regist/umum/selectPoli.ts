import { generateMessage, parse } from "./template";
import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import { ResponseHandler } from "../../../../types/Command";

const TEMPLATE_NAME = "msg.reg.umum.poli";
const QUERY = `SELECT id_unit, nama_unit FROM "public".unit`;
const PROPERTY_KEY = "poli";

async function handler(msg: WAMessage): Promise<AnyMessageContent> {
    return generateMessage(msg, TEMPLATE_NAME, QUERY, PROPERTY_KEY);
}

async function parseResponse(_msg: WAMessage): ResponseHandler {
    return await parse(_msg, PROPERTY_KEY);
}

export default {
    handler,
    parseResponse,
};

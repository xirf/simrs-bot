import { generateMessage, parse } from "./template";
import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import { ResponseHandler } from "../../../../types/Command";

const TEMPLATE_NAME = "msg.reg.umum.dokter";
const QUERY = `SELECT id_dokter, nama_dokter FROM "public".dokter WHERE id_unit=$1`;
const PROPERTY_KEY = "dokter";

async function handler(msg: WAMessage): Promise<AnyMessageContent> {
    return generateMessage(msg, TEMPLATE_NAME, QUERY, PROPERTY_KEY);
}

async function parseResponse(_msg: WAMessage): Promise<ResponseHandler> {
    return parse(_msg, PROPERTY_KEY);
}

export default {
    handler,
    parseResponse
};

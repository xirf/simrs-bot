/*
* Just for DRY (Don't Repeat Yourself) purpose
* The routes had same properties, so we can just use this template
*/

import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import { ResponseHandler } from "../../../../types/Command";
import config from "../../../../config";
import db from "../../../../db/client";
import state from "../../../../utils/state";
import extractMessage from "../../../../utils/extract";
import parseTemplate from "../../../../utils/parseTemplate";
import log from "../../../../utils/logger";

async function generateMessage(
    msg: WAMessage,
    templateName: string,
    query: string,
    propertyKey: string
): Promise<AnyMessageContent> {
    try {
        const { sender } = await extractMessage(msg);
        const userState = await state.get(sender);

        const result = await db.query(query, [ userState[ propertyKey ] ]);
        const template = await db.query(`SELECT template FROM "public".${config.tables.template} WHERE name='${templateName}'`);

        const formattedItems = result.rows.map((item, index) => `${index + 1}. ${item[ propertyKey ]}`);

        userState[ propertyKey ] = result.rows;
        await state.update(sender, userState);
        let objToSend = {
            name: userState.nama,
        };

        objToSend[ propertyKey ] = formattedItems.join("\n");

        return ({
            text: parseTemplate(template.rows[ 0 ].template, objToSend),
        });


    } catch (error) {
        log.error(error);
        return {
            text: "Terjadi kesalahan, silakan hubungi admin",
        };
    }
}

async function parse(_msg: WAMessage, propertyKey: string): Promise<ResponseHandler> {
    try {
        const { text, sender } = await extractMessage(_msg);
        const userState = await state.get(sender);

        const items = userState[ propertyKey ];
        const index = parseInt(text) - 1;

        if (isNaN(index)) {
            return {
                error: {
                    text: "Mohon maaf, silakan masukkan angka yang sesuai dengan pilihan",
                },
            };
        }

        const { [ propertyKey ]: id, nama } = items[ index ];

        userState[ `id_${propertyKey}` ] = id;
        userState[ propertyKey ] = nama;

        await state.update(sender, userState);
        return 1;
    } catch (error) {
        log.error(error);
        return {
            error: {
                text: "Terjadi kesalahan, \n\nJangan Khawatir kami sudah melaporkan masalah ini ke admin",
            },
        };
    }
}

export { generateMessage, parse };
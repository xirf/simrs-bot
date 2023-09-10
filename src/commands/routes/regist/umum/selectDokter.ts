import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import { ResponseHandler } from "../../../../types/Command";
import config from "../../../../config";
import db from "../../../../db/client";
import state from "../../../../utils/state";
import extractMessage from "../../../../utils/extract";
import parseTemplate from "../../../../utils/parseTemplate";
import log from "../../../../utils/logger";


async function handler(msg: WAMessage): Promise<AnyMessageContent> {
    try {
        // extract number from message
        // get from state we set before
        let { sender } = await extractMessage(msg);
        let userState = await state.get(sender);


        let dokter = await db.query(`SELECT nama_dokter, id_dokter from "public".dokter WHERE id_unit=$1`, [ userState.id_unit ]);
        let template = await db.query(`SELECT template from "public".${config.tables.template} WHERE name='msg.reg.umum.dokter'`);


        let _dokter = dokter.rows.map((item, index) => {
            return `${index + 1}. ${item.nama_dokter}`
        })


        // update the state, to avoid inconsistency from db
        userState.dokter = dokter.rows;
        await state.update(sender, userState);

        return ({
            text: parseTemplate(template.rows[ 0 ].template, {
                name: userState.nama,
                poli: _dokter.join("\n")
            })
        })

    } catch (error) {
        log.error(error)
        return ({
            text: "Terjadi kesalahan, silahkan hubungi admin"
        })
    }
}

async function parseResponse(_msg: WAMessage): ResponseHandler {
    try {
        let { text, sender } = await extractMessage(_msg);
        let userState = await state.get(sender);


        let dokter = userState.dokter
        let index = parseInt(text) - 1


        if (isNaN(index)) {
            return ({
                error: {
                    text: "Mohon maaf silahkan masukkan angka yang sesuai dengan pilihan"
                }
            })
        }


        let { id_dokter, nama_dokter } = dokter[ index ]

        // update the state
        userState.id_dokter = id_dokter;
        userState.nama_unit = nama_dokter;


        await state.update(sender, userState)
        return 1

    } catch (error) {
        log.error(error)
        return ({
            error: {
                text: "Terjadi kesalahan, silahkan hubungi admin"
            }
        })
    }
}

export default {
    handler,
    parseResponse
}


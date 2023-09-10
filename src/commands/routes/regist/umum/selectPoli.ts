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
        let { sender } = await extractMessage(msg);

        let query = `SELECT template from "public".${config.tables.template} WHERE name='msg.reg.umum.poli'`;

        let poli = await db.query(`SELECT id_unit, nama_unit from "public".unit `);
        let template = await db.query(query);

        // get from state we set before
        let userState = await state.get(sender);



        let _poli = poli.rows.map((item, index) => {
            // add number and poli to before nama_unit if needed
            let nama_unit = item.nama_unit
            if (!(nama_unit.toLowerCase().includes("poli"))) {
                nama_unit = "Poli " + nama_unit
            }

            return `${index + 1}. ${nama_unit}`
        })


        // update the state, to avoid inconsistency from db
        userState.poli = poli.rows;
        await state.update(sender, userState);

        return ({
            text: parseTemplate(template.rows[ 0 ].template, {
                name: userState.nama,
                poli: _poli.join("\n")
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


        let poli = userState.poli
        let index = parseInt(text) - 1


        if (isNaN(index)) {
            return ({
                error: {
                    text: "Mohon maaf silahkan masukkan angka yang sesuai dengan pilihan"
                }
            })
        }


        let { id_unit, nama_unit } = poli[ index ]

        // update the state
        userState.id_unit = id_unit
        userState.nama_unit = nama_unit.toLowerCase().includes("poli")
            ? nama_unit
            : "Poli " + nama_unit


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


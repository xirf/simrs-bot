import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import db from "../../db/client";
import config from "../../config";
import extractMessage from "../../utils/extract";

async function handler(_msg): Promise<AnyMessageContent> {
    try {


        let template = await db.query(`SELECT template from "public".${config.tables.template} WHERE name='msg.reg.umum' OR name='msg.reg.umum.img'`);
        let textTemplate = template.rows[ 0 ].template;
        let imgTemplate = template.rows[ 1 ].template;
        let response: AnyMessageContent = {
            text: "Silahkan masukkan nomor Rekam Medis Anda"
        }

        let isUrl = (str: string) => {
            let urlRegex = /(https?:\/\/[^\s]+)/g;
            return urlRegex.test(str);
        }

        if (isUrl(textTemplate)) {
            response = {
                image: {
                    url: textTemplate
                },
                caption: imgTemplate
            }
        } else if (isUrl(imgTemplate)) {
            response = {
                image: {
                    url: imgTemplate
                },
                caption: textTemplate
            }
        } else {
            response = {
                text: textTemplate
            }
        }

        return (response);
    } catch (error) {
        return ({
            text: "Terjadi kesalahan, silahkan hubungi admin"
        })
    }
}

async function parseResponse(msg: WAMessage) {
    let { text } = await extractMessage(msg)

    let query = `SELECT nama,  from "public".pasien WHERE no_rm=$1`;
    let result = await db.query(query, [ text ]);

}


export default {
    handler,
    parseResponse
}
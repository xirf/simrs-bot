import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import db from "../../db/client";
import config from "../../config";


async function handler(_msg: WAMessage): Promise<AnyMessageContent> {
    let query = `SELECT template from "public".${config.tables.template} WHERE name='msg.reg.bpjs'`;
    let template = await db.query(query);

    // sending location had a bug,
    // i cant send location with caption and still have open discussion on github
    // link" https://github.com/WhiskeySockets/Baileys/discussions/376
    return ({
        // location: {
        //     degreesLatitude: -7.868434238174951,
        //     degreesLongitude: 111.47335368380554,
        //     url: "https://www.google.com/maps/search/?api=1&query=-7.8682646,111.4734517",
        //     accuracyInMeters: 10,
        //     name: 'RSU Darmayu Ponorogo', 
        //     address: "Jl. Dr. Sutomo No.44 - 50, Bangunsari, Kec. Ponorogo, Kabupaten Ponorogo, Jawa Timur 63419",
        // },
        text: template.rows[0].template
    })
}


export default {
    handler
}
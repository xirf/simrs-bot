import { RoutesType } from "../../types/routes"
import pasienBaru from "./pasienBaru";
import booking from "./booking";
import DB from "../../db/database";

const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Silahkan masukkan nomor RM Anda\n\nJika tidak ada silahkan balas dengan \"pasien baru\"",
    collect: [ "noRM" ],
    beforeNext: async (text, state) => {

        if (text.toLowerCase().includes("baru")) {
            state.collection.rmStatus = "baru"
            return 0
        } else {
            const pasien = await DB.query(`SELECT * FROM "public"."pasien" WHERE no_rm = '${text}'`)
            if (!pasien.rows[ 0 ]) {
                state.collection.rmStatus = "invalid"
                return 0
            } else {
                state.collection.rmStatus = "lama"
                return 1
            }
        }
    },
    next: [
        pasienBaru,
        booking
    ]
}


export default routes
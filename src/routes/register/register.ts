import DB from "./../../db/database";
import { RoutesType } from "./../../types/routes"
import pasienBaru from "./pasienBaru"
import dataPasien from "./dataPasien"


const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Silahkan masukkan nomor RM Anda\n\nJika tidak ada silahkan balas dengan \"pasien baru\"",
    collect: [ "noRM" ],
    beforeNext: async (text, state) => {
        try {
            if (text == "pasien baru") {
                return 1
            }
            const isNew = await DB.query("select * from public.pasien where nomor_rm = $1", [ state.collection.noRM ])
            if (isNew.rows.length === 0) {
                state.collection.status = "tidak ditemukan"
                return 0
            } else {
                state.collection.namaPasien = isNew.rows.nama
                return 1
            }
        } catch (error) {
            console.log(error)
            return 1
        }
    },
    next: [
        dataPasien,
        pasienBaru,

    ]
}


export default routes
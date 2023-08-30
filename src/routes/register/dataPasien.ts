import DB from "./../../db/database";
import { BeforeSendParams, RoutesType, UserStateType } from "./../../types/routes"

const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Nomor RM Anda dikenali sebagai {{nama}}\n\njika ini bukan Anda silahkan ketik *\"batal\"*\n\nJika ini adalah benar Anda silahkan pilih poli yang ingin anda kunjungi dibawah ini \n\n{{poli}}\n\nBalas dengan nomor poli yang ingin Anda pilih\nContoh:\n1",
    collect: [ "idPoli" ],
    beforeCollect: async (msg: string, state: UserStateType) => {
        try {
            let polis = state.collection.allUnitForThisUser
            let match = msg.match(/\b\d+\b/g)
            let selected = 0;

            if (match) {
                selected = parseInt(match[ 0 ]) - 1
            }

            let res = await DB.query("Select id_unit from unit where nama_unit = $1", polis[ selected ])
            return [
                res.rows[0]
            ]
        } catch (error) {
        }

    },
    beforeSend: async (params: BeforeSendParams, state: UserStateType) => {
        let { messageText } = params

        let poli = await DB.query("SELECT DISTINCT u.nama_unit FROM unit u INNER JOIN dokter d ON u.id_unit = d.id_unit; ")
        state.collection.allUnitForThisUser = poli.rows

        let namaPoli = poli.map((v, i) => {
            return `${i + 1}. ${v}`
        }).join("\n")

        messageText.replace("{{nama}}", state.collection.nama).replace("{{poli}}", namaPoli)

        return { text: messageText }
    },
    next: [

    ]
}


export default routes
import type { RoutesType } from "../types/routes.d.ts"
import DB from "./../db/database"

let nextRoutes: RoutesType = {
    name: "Cek Antrian",
    messageText: "Nomor antrian anda adalah **{{noAntrian}}**\n\nSaat ini ada *{{sisaAntrian}}* antrian lagi\nHarap sabar menunggu ya",
    collect: [],
    beforeSend: async ({ messageText, collection }) => {
        let _text = messageText

        console.log("collection", collection)


        return { text: _text }
    },
    next: []
}

const routes: RoutesType = {
    name: "Cek Antrian",
    messageText: "Silahkan masukkan nomor antrian anda",
    collect: [ "noAntrian" ],
    next: [
        nextRoutes
    ]
}

export default routes
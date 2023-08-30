import DB from "./../../db/database";
import { BeforeSendParams, RoutesType, UserStateType } from "./../../types/routes"

const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Anda akan mendaftar sebagai pasien baru",
    collect: [ "noRM" ],
    beforeSend: async (params: BeforeSendParams, state: UserStateType) => {
        const { messageText } = params
        let _txt = messageText
        _txt += state.status == "tidak ditemukan" ? "\n\nDikarenakan nomor RM anda tidak ditemukan" : ""

        return { text: _txt }

    },
    next: [

    ]
}


export default routes
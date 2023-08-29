import type { RoutesType } from "../types/routes.d.ts"

const routes: RoutesType = {
    id: "root",
    name: "Cek Antrian",
    messageText: "Silahkan masukkan nomor antrian anda",
    collect: [ "idAntrian" ],
}

export default routes
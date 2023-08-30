import { RoutesType } from "src/types/routes";

const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Silahkan masukkan nomor RM Anda\n\nJika tidak ada silahkan balas dengan \"pasien baru\"",
    collect: [ "noRM" ],
}


export default routes
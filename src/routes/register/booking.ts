import { RoutesType } from "../../types/routes"
import pasienBaru from "./pasienBaru";
import pasienLama from "./booking";
import DB from "../../db/database";

const routes: RoutesType = {
    name: "Daftar pasien umum",
    messageText: "Booking",
    collect: [ "noRM" ],
}


export default routes
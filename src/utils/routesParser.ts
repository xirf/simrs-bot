import state from "src/db/state";
import { WAMessage } from "@whiskeysockets/baileys";
import botRoutes from "../routes/index"
import client from "./../libs/whatsapp/client"
import { writeFileSync } from "fs"
import DB from "../db/database"
import { parser } from "../libs/messageParser";
import { RoutesType } from "src/types/routes";

export default async (message: WAMessage) => {
    try {
        const { sender }: { sender: string } = await parser(message);

        const currentState = state.getData(sender)

        if (!currentState) {

        } else {
            function getNextRoutes(routes: RoutesType, index: any[]) {
                let next = index.pop()
                let currentRoutes: RoutesType = routes.next[ next ]
                if (index.length > 1) {
                    getNextRoutes(currentRoutes, index);
                } else {
                    return currentRoutes
                }
            }
        }

    } catch (error) {
        console.log(error)
    }

}
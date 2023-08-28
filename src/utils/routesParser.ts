import state from "src/db/state";
import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import botRoutes from "../routes/index"
import client from "./../libs/whatsapp/client"
import { writeFileSync } from "fs"
import DB from "../db/database"
import { parser } from "../libs/messageParser";
import { RoutesType } from "src/types/routes";

export default async (message: WAMessage) => {
    try {
        const { sender, text } = await parser(message);

        const currentState = state.getData(sender)

        function getNextRoutes(routes: RoutesType, index: any[]) {
            let next = index.pop()
            let currentRoutes: RoutesType = routes.next[ next ]
            if (index.length > 1) {
                getNextRoutes(currentRoutes, index);
            } else {
                return currentRoutes
            }
        }

        let currentRoutes = getNextRoutes(botRoutes, currentState.routes);
        let newState = currentState

        runCurrentRoutes(currentRoutes);

        async function runCurrentRoutes(routes: RoutesType) {

            let { messageText, next, beforeCollect, beforeSend } = routes

            if (beforeCollect) {
                let _newState = beforeCollect(text)
                newState = {
                    routes: [ ...currentState.routes ],
                    collection: [ ...currentState.collection, ..._newState ]
                }
                state.setData(sender, newState)
            }

            let _message: AnyMessageContent = { text: messageText }

            if (beforeSend) {
                _message = await beforeSend({
                    messageText,
                    fullMessage: message,
                    collection: newState.collection,
                    nextRoutes: next
                })
            }

            state.setData(sender, newState)
            await client.reply(message.key, _message)
            return;
        }

        return;
    } catch (error) {
        console.log(error)
    }

}
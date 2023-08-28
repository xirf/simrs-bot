import state from "../db/state";
import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import botRoutes from "../routes/index"
import client from "./../libs/whatsapp/client"
import { writeFileSync } from "fs"
import { parser } from "../libs/messageParser";
import { RoutesType } from "../types/routes";

export default async (message: WAMessage) => {
    try {
        const { sender, text } = await parser(message);

        let currentState = state.getData(sender)
        if (!currentState || currentState.routes == undefined || currentState.collection == undefined) {
            currentState = {
                isCollecting: false,
                routes: [],
                collection: []
            }
        }
        let newState = currentState

        if (currentState.isCollecting) {
            let _routes = [ ...currentState.routes ]
            let _collectible = {}
            _routes.pop()

            let currentRoutes = getNextRoutes(botRoutes, _routes)
            if (currentRoutes.beforeCollect) {
                let _collections = await currentRoutes.beforeCollect(text)
                currentRoutes.collect.forEach((el, index) => {
                    _collectible[ el ] = _collections[ index ]
                })
            } else {
                _collectible[ currentRoutes.collect[ 0 ] ] = text
            }

            currentState.collection.push(_collectible)
        }

        function getNextRoutes(routes: RoutesType, index: any[]) {
            let next = index.pop()
            let currentRoutes: RoutesType = routes.next[ next ]
            if (index.length > 1) {
                getNextRoutes(currentRoutes, index);
            } else {
                return routes
            }
        }

        let _next = getNextRoutes(botRoutes, currentState.routes)
        runCurrentRoutes(_next);

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
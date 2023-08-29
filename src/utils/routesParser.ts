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
        console.log("New Message from", sender)

        let currentState = await state.getData(sender);
        console.log("State from db", currentState)

        if (!currentState || currentState.routes == undefined || currentState.collection == undefined) {
            currentState = {
                isCollecting: false,
                routes: [],
                collection: []
            };
        }

        let newState = { ...currentState };
        console.log("Cloned state", newState)

        if (newState.isCollecting) {
            let _routes = [ ...newState.routes ];
            let _collectible = {};
            _routes.pop();

            let currentRoutes = getNextRoutes(botRoutes, _routes);

            if (currentRoutes.beforeCollect) {
                let _collections = await currentRoutes.beforeCollect(text);
                currentRoutes.collect.forEach((el, index) => {
                    _collectible[ el ] = _collections[ index ];
                });
            } else {
                _collectible[ currentRoutes.collect[ 0 ] ] = text;
            }

            if (currentRoutes.beforeNext) {
                newState.routes.push(await currentRoutes.beforeNext(text));
            } else {
                let _isMatch = text.match(/\b\d+\b/g);
                console.log("_isMatch", _isMatch)
                if (_isMatch && parseInt(_isMatch[ 0 ]) <= currentRoutes.next.length) {
                    newState.routes.push(parseInt(_isMatch[ 0 ]) - 1);
                } else {
                    newState.routes.push(0);
                }

            }
            newState.collection.push(_collectible);
        }


        function getNextRoutes(routes: RoutesType, index: any[]) {
            if (index.length < 1) return routes
            else {
                let next = [ ...index ].pop()
                if (routes.next[ next ]) {
                    let currentRoutes: RoutesType = routes.next[ next ]
                    if (index.length > 1) getNextRoutes(currentRoutes, index);
                    else return currentRoutes
                } else return botRoutes
            }
        }

        let _next = getNextRoutes(botRoutes, newState.routes)
        runCurrentRoutes(_next);

        async function runCurrentRoutes(routes: RoutesType) {
            console.log(JSON.stringify(routes))
            if (!routes) routes = botRoutes[ 0 ]
            let { messageText, next, beforeCollect, beforeSend } = routes

            if (beforeCollect) {
                let _newState = await beforeCollect(text)
                newState = {
                    routes: [ ...newState.routes ],
                    collection: [ ...newState.collection, ..._newState ]
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

            newState.isCollecting = true;

            await state.setData(sender, newState)
            await client.reply(message.key, _message)
        }

        return;
    } catch (error) {
        console.log(error)
    }

}
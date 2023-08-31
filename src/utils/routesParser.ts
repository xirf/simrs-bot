import state from "../db/state";
import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";
import botRoutes from "../routes/index"
import client from "./../libs/whatsapp/client"
import { parser } from "../libs/messageParser";
import { RoutesType } from "../types/routes";

export default async (message: WAMessage) => {
    try {
        const { sender, text } = await parser(message);
        let currentState = await state.getData(sender);

        if (!currentState || currentState.routes === undefined || currentState.collection === undefined) {
            currentState = {
                isCollecting: false,
                routes: [],
                collection: {}
            };
        }


        let newState = { ...currentState };


        if (newState.isCollecting) {
            let _routes = [ ...newState.routes ];
            let _collectible = newState.collection;
            let currentRoutes = await getNextRoutes(botRoutes, _routes);

            if (currentRoutes.collect.length !== 0) {
                if (currentRoutes.beforeCollect) {
                    let _collections = await currentRoutes.beforeCollect(text, newState);
                    currentRoutes.collect.forEach((el, index) => {
                        _collectible[ el ] = _collections[ index ];
                    });
                } else {
                    _collectible[ currentRoutes.collect[ 0 ] ] = text;
                }

            }

            if (currentRoutes.beforeNext) {
                newState.routes.push(await currentRoutes.beforeNext(text, newState));
            } else {
                let _isMatch = text.match(/\b\d+\b/g);
                if (_isMatch && parseInt(_isMatch[ 0 ]) <= currentRoutes.next.length) {
                    newState.routes.push(parseInt(_isMatch[ 0 ]) - 1);
                } else {
                    newState.routes.push(0);
                }
            }
        }


        function getNextRoutes(routes: RoutesType, index: any[]) {
            return new Promise<RoutesType>(async (resolve, reject) => {

                let selectedRoutes: RoutesType
                if (index.length === 0) {
                    selectedRoutes = routes
                } else {
                    let next = index.pop()
                    if (routes.next[ next ]) {
                        let currentRoutes: RoutesType = routes.next[ next ]
                        if (index.length > 0 && currentRoutes.next.length > 0) {
                            selectedRoutes = await getNextRoutes(currentRoutes, index)
                        }
                        else {
                            selectedRoutes = currentRoutes
                        }
                    } else {
                        selectedRoutes = botRoutes
                    }
                }

                resolve(selectedRoutes)
            })
        }


        let _next = await getNextRoutes(botRoutes, [ ...newState.routes ])
        runCurrentRoutes(_next);


        async function runCurrentRoutes(routes: RoutesType) {

            if (!routes) {
                return;
            };

            let { messageText, next, beforeCollect, beforeSend } = routes

            if (beforeCollect) {
                let _newState = await beforeCollect(text, newState)
                newState.collection = [ ...newState.collection, ..._newState ]
                state.setData(sender, newState)
            }

            let _message: AnyMessageContent = { text: messageText }

            if (beforeSend) {
                let beforeSendResult = await beforeSend({
                    messageText,
                    fullMessage: message,
                    collection: newState.collection,
                    nextRoutes: next
                }, newState)

                if(beforeSendResult && beforeSendResult != null) _message = beforeSendResult
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
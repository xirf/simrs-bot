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

        // make a copy of the current routes for later use and avoid mutation
        let newState = { ...currentState };

        // Get the next routes based on the current routes
        if (newState.isCollecting) await handleCollectingData(newState, getNextRoutes, text);


        let _next = await getNextRoutes(botRoutes, [ ...newState.routes ])
        runCurrentRoutes(_next, newState, sender, text, message)

        return;
    } catch (error) {
        console.log(error)
    }
}

function getNextRoutes(routes: RoutesType, index: number[]): Promise<RoutesType> {
    return new Promise<RoutesType>(async (resolve, _reject) => {
        let selectedRoutes: RoutesType;

        if (index.length === 0) {
            // If no more indices are left, return the current route
            resolve(routes);
            return;
        }

        const nextIndex = index.pop();

        if (routes.next && routes.next[ nextIndex ]) {
            const currentRoutes: RoutesType = routes.next[ nextIndex ];

            if (index.length > 0 && currentRoutes.next && currentRoutes.next.length > 0) {
                // Recursively call getNextRoutes if there are more indices and next routes
                selectedRoutes = await getNextRoutes(currentRoutes, index);
            } else {
                selectedRoutes = currentRoutes;
            }
        } else {
            // If the next route doesn't exist, you can handle this case accordingly
            // For now, let's resolve to undefined
            selectedRoutes = routes;
        }

        resolve(selectedRoutes);
    });
}

async function runCurrentRoutes(routes, newState, sender, text, message) {
    // if there is no routes, exit
    if (!routes) return;

    // get messageText, next, beforeCollect, beforeSend
    let { messageText, next, beforeCollect, beforeSend } = routes

    // if beforeCollect is exist, run beforeCollect
    if (beforeCollect) {
        // run beforeCollect
        let _newState = await beforeCollect(text, newState)
        // add _newState to newState
        newState.collection = [ ...newState.collection, ..._newState ]
        // set newState to sender state
        state.setData(sender, newState)
    }

    // create _message
    let _message: AnyMessageContent = { text: messageText }

    // if beforeSend is exist, run beforeSend
    if (beforeSend) {
        // run beforeSend and get beforeSendResult
        let beforeSendResult = await beforeSend({
            messageText,
            fullMessage: message,
            collection: newState.collection,
            nextRoutes: next
        }, newState)

        // if beforeSendResult is exist and not null, set _message to beforeSendResult
        if (beforeSendResult && beforeSendResult != null) _message = beforeSendResult
    }

    // set isCollecting to true and set newState to sender state
    newState.isCollecting = true;
    await state.setData(sender, newState)

    // send message
    await client.reply(message.key, _message)
}

async function handleCollectingData(
    newState: {
        isCollecting: boolean;
        routes: number[];
        collection: any;
        status?: unknown;
    },
    getNextRoutes: (routes: RoutesType, index: number[]) => Promise<RoutesType>,
    text: string
) {
    // Make copies of the routes and collectible objects
    const _routes = [ ...newState.routes ];
    const _collectible = newState.collection;

    // Get the current routes based on the copied routes
    const currentRoutes = await getNextRoutes(botRoutes, _routes);

    // Check if there are items to collect
    if (currentRoutes.collect.length !== 0) {
        if (currentRoutes.beforeCollect) {
            // Execute beforeCollect if defined
            const _collections = await currentRoutes.beforeCollect(text, newState);

            // Iterate through collect items and store them
            currentRoutes.collect.forEach((el, index) => {
                _collectible[ el ] = _collections[ index ];
            });
        } else {
            // Store the collected text at the specified index
            _collectible[ currentRoutes.collect[ 0 ] ] = text;
        }
    }

    if (currentRoutes.beforeNext) {
        // Log beforeNext and execute it if defined
        console.log("Before next", newState);
        newState.routes.push(await currentRoutes.beforeNext(text, newState));
        console.log("After next", newState);
    } else {
        // Check for a numeric match in the text
        const _isMatch = text.match(/\b\d+\b/g);

        if (_isMatch && currentRoutes?.next && parseInt(_isMatch[ 0 ]) <= currentRoutes?.next?.length) {
            // Push the numeric match as the next route index (subtracting 1 for 0-based index)
            newState.routes.push(parseInt(_isMatch[ 0 ]) - 1);
        } else {
            // Push 0 as the next route index if no numeric match
            newState.routes.push(0);
        }
    }
}

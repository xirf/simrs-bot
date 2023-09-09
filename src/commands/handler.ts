import { WAMessage } from "@whiskeysockets/baileys";
import type { Reply } from "../types/Client.d.ts";
import state from "../utils/state";
import extractMessage from "../utils/extract.js";
import conversationFlow from "./conversationFlow";
import { ConversationRoute } from "../types/Command.js";
import log from "../utils/logger.js";
import db from "../db/client.js";
import config from "../config/index.js";


export default async function handler(msg: WAMessage, reply: Reply): Promise<void> {
    try {
        const { sender } = await extractMessage(msg);
        let lastState = await state.get(sender);

        if (!lastState) {
            // If there's no conversation state, start a new one with the initial route
            await state.update(sender, {
                lastRoutes: "msg.welcome",
                awaitResponse: false,
            });
            lastState = await state.get(sender);
        }

        // Get the current route from the state
        const routes: ConversationRoute = conversationFlow[ lastState.lastRoutes ];

        // if awaitResponse is true, then we need to process the response
        if (lastState.awaitingResponse) {
            let response = await routes.awaitResponse(msg);


            // handle cancel
            if (response.toString().toLowerCase() === "batal") {
                reply({ text: "Terima kasih sudah menggunakan layanan kami" }, sender);
                await state.clear(sender);
                return;

            } else if (response.toString().toLowerCase() === "invalid") {

                // handle if input invalid
                let query = `SELECT template from "public".${config.tables.template} where name='msg.err.invalidInput'`
                let template = await db.query(query)
                let text = template.rows[ 0 ].template + "\n\n" + await routes.handler(msg);


                reply({ text }, sender)
                return;
            }


            // If there's a transition, update the state with the next route
            if (routes.transitions) {
                for (const transition of routes.transitions) {
                    if (transition.condition(response)) {
                        // run the handler for the next route
                        reply(await conversationFlow[ transition.nextRoute ].handler(msg), sender);

                        // update the state with the next route if present
                        if (conversationFlow[ transition.nextRoute ].transitions) {
                            await state.update(sender, {
                                lastRoutes: transition.nextRoute,
                                awaitingResponse: true,
                            });
                        } else {
                            await state.update(sender, {
                                lastRoutes: "end",
                                awaitingResponse: false,
                            });

                            // clear the state
                            await state.clear(sender);
                        }
                        break;
                    }
                }
            }

        } else {
            reply(await routes.handler(msg), sender);
            if (routes.transitions) {
                // If there's a transition, update the state with the next route
                await state.update(sender, {
                    lastRoutes: lastState.lastRoutes,
                    awaitingResponse: true,
                });
            }
        }

        return;
    } catch (error) {
        // Handle errors if needed
        log.error(error);
    }
}

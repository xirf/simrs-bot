import { WAMessage } from "@whiskeysockets/baileys";
import welcomeMessage from "./welcome.js";
import { writeFileSync } from "fs";
import extractMessage from "../utils/extract";



const conversationFlow = {
    "msg.welcome": {
        handler: welcomeMessage,
        awaitResponse: async (msg: WAMessage) => {
            console.log("MSG.WELCOME", JSON.stringify(msg));
            writeFileSync("msg.welcome.json", JSON.stringify(msg, null, 2));

            let { text } = await extractMessage(msg);

            return text === "yes";
        },
        transitions: [
            {
                condition: (_) => { return true },
                nextRoute: "msg.true",
            },
            {
                condition: (_) => { return true },
                nextRoute: "msg.false",
            },
        ]
    },
    "msg.true": {
        handler: (msg: WAMessage) => {
            writeFileSync("msg.true.json", JSON.stringify(msg, null, 2));
            
            return ({ text: "Terima kasih" })
        },
        awaitResponse: async (msg: WAMessage) => {
            let { text } = await extractMessage(msg);
            return text === "yes";
        },
        transitions: [
            {
                condition: (resp) => {
                    console.log("MSG.TRUE", resp);
                    return (resp === true)
                },
                nextRoute: "msg.true2",
            },
            {
                condition: (resp) => {
                    console.log("MSG.TRUE", resp)
                    return (resp === false)
                },
                nextRoute: "msg.false",
            },
        ]
    },
    "msg.true2": {
        handler: () => { return ({ text: "Msg Handler 2" }) },
    },
    "msg.false": {
        handler: () => { return ({ text: "Ups! Maaf ya" }) },
    },
    "end": {
        handler: () => { return ({ text: "Terima kasih sudah selesai" }) },
    }

};

export default conversationFlow
import { WAMessage } from "@whiskeysockets/baileys";
import welcomeMessage from "./welcome.js";




const conversationFlow = {
    "msg.welcome": {
        handler: welcomeMessage,
        awaitResponse: (msg: WAMessage) => {
            return msg.message?.conversation === "yes";
        },
        transitions: [
            {
                condition: (resp) => resp === true,
                nextRoute: "msg.true",
            },
            {
                condition: (resp) => resp === false,
                nextRoute: "msg.false",
            },
        ]
    },
    "msg.true": {
        handler: () => { text: "Terima kasih" },
        awaitResponse: (msg: WAMessage) => {
            return msg.message?.conversation === "yes";
        },
        transitions: [
            {
                condition: (resp) => resp === true,
                nextRoute: "msg.true2",
            },
            {
                condition: (resp) => resp === false,
                nextRoute: "msg.false",
            },
        ]
    },
    "msg.true2": {
        handler: () => { text: "Msg Handler 2" },
    },
    "msg.false": {
        handler: () => { text: "Ups! Maaf ya" },
    },
    "end": {
        handler: () => { text: "Terima kasih sudah selesai" },
    }

};

export default conversationFlow
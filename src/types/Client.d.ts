import { AnyMessageContent } from "@whiskeysockets/baileys"

declare type Reply = (msg: AnyMessageContent, jid: string) => Promise<void>

declare type ClientAuth = {
    state: AuthenticationState
    saveState: () => Promise<void>
    clearState: () => Promise<void>
}
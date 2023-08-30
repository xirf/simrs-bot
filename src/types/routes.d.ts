import { AnyMessageContent, WAMessage } from "@whiskeysockets/baileys";

/**
 * Represents a function that is called before moving to the next step.
 * @param text - The message text.
 * @param state - The state of the user.
 * @returns A Promise that resolves to a number.
 *
 * @remarks
 * This function is used to perform some actions before navigating to the next step.
 * The `state` parameter represents the current user state. You can modify it directly,
 * but be cautious as it can affect how the routes work.
 *
 * @example
 * ```typescript
 * const result = await beforeNext("Hello, world!", userState);
 * console.log(`Result: ${result}`);
 * ```
 */
declare type BeforeNext = (text: string, state: any) => Promise<number>;

declare type BeforeSendParams = {
    messageText: string;
    fullMessage: WAMessage;
    collection: any[];
    nextRoutes: RoutesType[];
};

/**
 * Represents a function that is called before sending a message.
 * @param params - An object containing message-related parameters.
 * @returns A Promise that resolves to a message content or null.
 */
declare type BeforeSend = (params: BeforeSendParams, state: UserStateType) => Promise<AnyMessageContent | null>;

declare type beforeCollect = (message: string, state: any) => Promise<any[]>;

declare type RoutesType = {
    name: string;
    messageText: string;
    collect: any[];
    beforeCollect?: beforeCollect;
    beforeSend?: BeforeSend;
    beforeNext?: BeforeNext;
    next?: RoutesType[];
};


declare type UserStateType = {
    isCollecting: boolean;
    routes: number[];
    collection: Object<any>;
    status?: unknown
};
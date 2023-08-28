# This is bot routes not a server routes

for server routes you can find it in server folder

## This folder mention to be routes for chat flow

the main idea is to make customization more easier and more readable using visual novel like flow
all routes must have structure like this

```ts
import routesB from "routesB"
import routesC from "routesC"

const routes:RoutesType = {
    "id": string | number,
    "name": string,
    "messageText": anyMessageType,
    "collect": any[],
    "beforeCollect": (message:string)=> Promise<any[]>
    "beforeSend": (messagetText:string, collection:any, next: RoutesType[])=>Promise<AnyMessageType>
    "next": [
        routesB,
        routesC
    ]
}

export default routes
```

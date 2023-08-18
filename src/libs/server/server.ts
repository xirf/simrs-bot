import Fastify, { FastifyServerOptions } from 'fastify';
import websocket from "@fastify/websocket"
import client from '../whatsapp/client';
import { pino } from "pino";


const server = (opts?: FastifyServerOptions) => {
    const fastify = Fastify({
        logger: {
            level: 'debug',
            transport: {
                target: 'pino-pretty'
            }
        }
    });
    fastify.register(websocket);

    fastify.register(async function (fastify) {
        fastify.get('/ws', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on('message', message => {
                // message.toString() === 'hi from client'
                connection.socket.send('hi fzrom server')
            })

            client.on('messagesUpsert', (message) => {
                try {
                    connection.socket.send(JSON.stringify(message))
                } catch (error) {
                    connection.socket.send("JSON.stringify(message)")
                }
            })


        })
    })

    return fastify;
}

export default server;
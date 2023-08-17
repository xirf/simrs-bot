import { FastifyInstance } from 'fastify'
import connection from '../whatsapp/client'

export const apiRoutes = (fastify: FastifyInstance) => {
    return fastify.register(async function (app, _, next) {
        app.post('/sendMessage', async (request, reply) => {
            let { jid, text } = request.body as { jid: string, text: string };

            if (!jid || !text) reply.send({ status: 'error', message: 'jid and text are required' });

            await connection.sendMessage(jid, text);

            reply.send({ status: 'ok' });
        })

        app.post('/sendImage', async (request, reply) => {
            let { jid, path, caption } = request.body as { jid: string, path: string, caption: string };

            if (!jid || !path) reply.send({ status: 'error', message: 'jid, path and caption are required' });

            if (!caption) caption = '';

            await connection.sendImage(jid, path, caption);

            reply.send({ status: 'ok' });
        })

        next()
    }, { prefix: '/api/v1' })
}
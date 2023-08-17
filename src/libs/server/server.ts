import Fastify, { FastifyServerOptions } from 'fastify';
import View from '@fastify/view';


const server = (opts?: FastifyServerOptions) => {
    const fastify = Fastify({ ...opts });

    fastify.get('/', async (request, reply) => {
        return reply.send({ status: 'ok' });
    });

    return fastify;
}

export default server;
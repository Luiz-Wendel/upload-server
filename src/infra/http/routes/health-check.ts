import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';

export const healthCheckRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/health',
    {
      schema: {
        summary: 'Health check',
        description: 'Check if the server is running',
        tags: ['Health'],
        response: {
          200: z.object({ message: z.string() }).describe('Check successful'),
        },
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({ message: 'OK' });
    }
  );
};

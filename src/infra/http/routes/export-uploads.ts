import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { exportUploads } from '@/app/services/export-uploads';
import { unwrapEither } from '@/utils/either';

export const exportUploadsRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads/export',
    {
      schema: {
        summary: 'Export uploads',
        description: 'Export uploaded files from the server as a CSV file',
        tags: ['Upload'],
        querystring: z.object({
          searchQuery: z.string().optional(),
        }),
        response: {
          200: z.object({
            reportUrl: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { searchQuery } = request.query;

      const result = await exportUploads({
        searchQuery,
      });

      const { reportUrl } = unwrapEither(result);

      return reply.status(200).send({ reportUrl });
    }
  );
};

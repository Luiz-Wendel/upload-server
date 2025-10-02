import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
// services
import { uploadImage } from '@/app/services/upload-image';
// db
import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload image',
        description: 'Upload an image to the server',
        tags: ['Upload'],
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({ uploadId: z.string() }),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 5, // 1024 = kb * 1024 = mb * 5 = 5mb
        },
      });

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'No file uploaded' });
      }

      await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      });

      return reply.status(201).send({ uploadId: 'test' });
    }
  );
};

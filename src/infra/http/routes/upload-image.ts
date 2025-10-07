import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
// services
import { uploadImage } from '@/app/services/upload-image';
// utils
import { isRight, unwrapEither } from '@/utils/either';

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
          201: z.null().describe('Upload successful'),
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

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      });

      if (isRight(result)) {
        console.log('result:', unwrapEither(result));

        return reply.status(201).send();
      }

      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case 'InvalidFileFormatError':
          return reply.status(400).send({ message: error.message });
      }
    }
  );
};

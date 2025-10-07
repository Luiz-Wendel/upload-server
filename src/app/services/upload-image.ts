import { Readable } from 'node:stream';
import { z } from 'zod';
// errors
import { InvalidFileFormatError } from '@/app/services/errors/invalid-file-format';
// db
import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';
// storage
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage';
// utils
import { type Either, makeLeft, makeRight } from '@/utils/either';

const uploadImageInput = z.object({
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.input<typeof uploadImageInput>;

const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];

export async function uploadImage(
  input: UploadImageInput
): Promise<Either<InvalidFileFormatError, { url: string }>> {
  const { fileName, contentType, contentStream } =
    uploadImageInput.parse(input);

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormatError());
  }

  const { key, url } = await uploadFileToStorage({
    folder: 'images',
    fileName,
    contentType,
    contentStream,
  });

  await db.insert(schema.uploads).values({
    name: fileName,
    remoteKey: key,
    remoteUrl: url,
  });

  return makeRight({ url });
}

import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { uploadBufferToGcs } from './google-cloud-storage';

export function UploadFile(
  field: string,
  folder: string,
  isStrictPath: boolean = true,
) {
  return FileInterceptor(field, {
    storage: {
      _handleFile(req, file, cb) {
        const uniqueSuffix = isStrictPath
          ? `${Date.now()}-${uuid()}`
          : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const objectKey = `${folder.replace(/^\/+|\/+$/g, '')}/${uniqueSuffix}${extname(file.originalname)}`;

        const chunks: Buffer[] = [];
        file.stream.on('data', (chunk) => chunks.push(chunk));
        file.stream.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            await uploadBufferToGcs(objectKey, buffer, file.mimetype);
            cb(null, {
              path: objectKey,
              filename: objectKey,
            });
          } catch (error) {
            cb(error, null);
          }
        });
      },
      _removeFile(req, file, cb) {
        cb(null);
      },
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // optional: 5MB max
    },
  });
}

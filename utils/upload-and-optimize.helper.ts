import { FileInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

export function UploadAndOptimizeImage(field: string, folder: string) {
  return FileInterceptor(field, {
    storage: {
      _handleFile(req, file, cb) {
        if (!existsSync(folder)) {
          mkdirSync(folder, { recursive: true });
        }

        const uniqueSuffix = `${Date.now()}-${uuid()}`;
        const fileName = uniqueSuffix + extname(file.originalname);
        const fullPath = join(folder, fileName);

        const chunks: Buffer[] = [];
        file.stream.on('data', (chunk) => chunks.push(chunk));
        file.stream.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            const optimized = await sharp(buffer)
              .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 70 })
              .toBuffer();

            writeFileSync(fullPath, optimized);
            cb(null, { path: fullPath, filename: fileName });
          } catch (err) {
            cb(err, null);
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
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });
}

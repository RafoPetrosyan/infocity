import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

interface UploadOptions {
  folder: string;
  withThumb?: boolean;
  thumbSize?: number;
}

/**
 * Custom interceptor to upload and optimize multiple image fields
 */
export function UploadAndOptimizeImages(
  fields: { name: string; maxCount?: number }[],
  options: UploadOptions,
) {
  const { folder, withThumb = false, thumbSize = 400 } = options;

  return FileFieldsInterceptor(fields, {
    storage: {
      _handleFile(req, file, cb) {
        if (!existsSync(folder)) {
          mkdirSync(folder, { recursive: true });
        }

        const uniqueSuffix = `${Date.now()}-${uuid()}`;
        const ext = extname(file.originalname);
        const fileName = uniqueSuffix + ext;
        const fullPath = join(folder, fileName);

        const thumbName = withThumb ? uniqueSuffix + '-thumb' + ext : null;
        const thumbPath = withThumb ? join(folder, thumbName!) : null;

        const chunks: Buffer[] = [];
        file.stream.on('data', (chunk) => chunks.push(chunk));
        file.stream.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            // Optimize original
            const optimizedOriginal = await sharp(buffer)
              .jpeg({ quality: 85 })
              .toBuffer();

            writeFileSync(fullPath, optimizedOriginal);

            let fileObj: any = {
              path: fullPath,
              filename: fileName,
            };

            if (withThumb && thumbPath) {
              const optimizedThumb = await sharp(buffer)
                .resize(thumbSize, thumbSize, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .jpeg({ quality: 70 })
                .toBuffer();

              writeFileSync(thumbPath, optimizedThumb);

              fileObj.thumbPath = thumbPath;
              fileObj.thumbFilename = thumbName;
            }

            cb(null, fileObj);
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

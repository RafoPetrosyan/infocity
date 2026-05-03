import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { uploadBufferToGcs } from './google-cloud-storage';

interface FieldOption {
  name: string;
  maxCount?: number;
  withThumb?: boolean;
  thumbSize?: number;
  qualityValue?: number;
  thumbQualityValue?: number;
}

interface UploadOptions {
  folder: string;
  folderResolver?: (req: any) => string;
}

export function UploadAndOptimizeImages(
  fields: FieldOption[],
  options: UploadOptions,
) {
  const { folder, folderResolver } = options;

  return FileFieldsInterceptor(fields, {
    storage: {
      _handleFile(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${uuid()}`;
        const resolvedFolder = (folderResolver?.(req) || folder).replace(
          /^\/+|\/+$/g,
          '',
        );
        const fileName = `${uniqueSuffix}.jpg`;
        const objectKey = `${resolvedFolder}/${fileName}`;

        // Find field-specific config
        const fieldConfig = fields.find((f) => f.name === file.fieldname);
        const withThumb = fieldConfig?.withThumb ?? false;
        const thumbSize = fieldConfig?.thumbSize ?? 400;
        const qualityValue = fieldConfig?.qualityValue ?? 85;
        const thumbQualityValue = fieldConfig?.thumbQualityValue ?? 70;

        const thumbName = withThumb ? `${uniqueSuffix}-thumb.jpg` : null;
        const thumbObjectKey = withThumb
          ? `${resolvedFolder}/${thumbName}`
          : null;

        const chunks: Buffer[] = [];
        file.stream.on('data', (chunk) => chunks.push(chunk));
        file.stream.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            // Optimize original
            const optimizedOriginal = await sharp(buffer)
              .jpeg({ quality: qualityValue })
              .toBuffer();

            await uploadBufferToGcs(objectKey, optimizedOriginal, 'image/jpeg');

            let fileObj: any = {
              path: objectKey,
              filename: objectKey,
            };

            if (withThumb && thumbObjectKey && thumbName) {
              const optimizedThumb = await sharp(buffer)
                .resize(thumbSize, thumbSize, {
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .jpeg({ quality: thumbQualityValue })
                .toBuffer();

              await uploadBufferToGcs(
                thumbObjectKey,
                optimizedThumb,
                'image/jpeg',
              );

              fileObj.thumbPath = thumbObjectKey;
              fileObj.thumbFilename = thumbObjectKey;
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
      fileSize: 2 * 1024 * 1024, // 2MB
    },
  });
}

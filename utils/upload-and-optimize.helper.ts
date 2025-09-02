import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

export function UploadAndOptimizeImage(field: string, folder: string) {
  return FileInterceptor(field, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (!existsSync(folder)) {
          mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${uuid()}`;
        const fileName = uniqueSuffix + extname(file.originalname);

        cb(null, fileName);

        const fullPath = join(folder, fileName);

        setImmediate(async () => {
          try {
            await sharp(fullPath).jpeg({ quality: 70 }).toFile(fullPath);
          } catch (error) {
            console.error('Image optimization failed:', error);
          }
        });
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
}

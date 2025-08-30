import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export function UploadFile(field: string, folder: string) {
  return FileInterceptor(field, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (!existsSync(folder)) {
          mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
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
      fileSize: 5 * 1024 * 1024, // optional: 5MB max
    },
  });
}

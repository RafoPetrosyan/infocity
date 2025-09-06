import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export function UploadFile(
  field: string,
  folder: string,
  isStrictPath: boolean = true,
) {
  return FileInterceptor(field, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        if (!existsSync(folder)) {
          mkdirSync(folder, { recursive: true });
        }
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = isStrictPath
          ? `${Date.now()}-${uuid()}`
          : `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
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

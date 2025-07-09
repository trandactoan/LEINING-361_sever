// src/image/image.controller.ts
import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

const IMAGE_PATH = process.env.IMAGE_PATH || 'var/www/public/image';

@Controller('image')
export class ImageController {
  // Upload Image
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMAGE_PATH,
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB max
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      path: `${process.env.BASE_IMAGE_URL}${IMAGE_PATH}/${file.filename}`,
      url: `/image/${file.filename}`, // e.g. for frontend usage
    };
  }

  // Delete Image
  @Delete('remove/:filename')
  removeImage(@Param('filename') filename: string) {
    const filePath = join(IMAGE_PATH, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    fs.unlinkSync(filePath);
    return { message: 'File deleted', filename };
  }
}

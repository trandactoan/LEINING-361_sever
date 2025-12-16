// src/image/image.controller.ts
import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
  Get,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import * as fs from 'fs';

const DEFAULT_IMAGE_SUBPATH = join('var', 'www', 'public', 'image');
const IMAGE_PATH = resolve(process.env.IMAGE_PATH || join(process.cwd(), DEFAULT_IMAGE_SUBPATH));
const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL || 'http://localhost:8080/';

@Controller('image')
export class ImageController {
  // Upload Image
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          // Ensure destination exists before multer writes the file
          try {
            if (!fs.existsSync(IMAGE_PATH)) {
              fs.mkdirSync(IMAGE_PATH, { recursive: true });
            }
            callback(null, IMAGE_PATH);
          } catch (err) {
            callback(err as any, IMAGE_PATH);
          }
        },
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
      path: BASE_IMAGE_URL + 'image/' +file.filename,
      url: join('image', file.filename), // e.g. for frontend usage
    };
  }

  // Delete Image
  @Delete('remove/:filename')
  removeImage(@Param('filename') filename: string) {
    const filePath = join(IMAGE_PATH, filename);
    try {
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('File not found');
      }
      fs.unlinkSync(filePath);
      return { message: 'File deleted', filename };
    } catch (err) {
      throw new BadRequestException(`Failed to delete file: ${err?.message || err}`);
    }
  }

  @Get(':filename')
  getImage(@Param('filename') filename: string): StreamableFile {
    const filePath = join(IMAGE_PATH, filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }
}

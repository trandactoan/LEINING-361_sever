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
import { memoryStorage } from 'multer';
import { join, resolve } from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';

const DEFAULT_IMAGE_SUBPATH = join('var', 'www', 'public', 'image');
const IMAGE_PATH = resolve(process.env.IMAGE_PATH || join(process.cwd(), DEFAULT_IMAGE_SUBPATH));
const BASE_IMAGE_URL = process.env.BASE_IMAGE_URL || 'http://localhost:8080/';

const WEBP_QUALITY = 80;
const SVG_MIME = 'image/svg+xml';

@Controller('image')
export class ImageController {
  // Upload Image — converts to WebP before saving (SVGs are stored as-is)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      if (!fs.existsSync(IMAGE_PATH)) {
        fs.mkdirSync(IMAGE_PATH, { recursive: true });
      }
    } catch (err) {
      throw new BadRequestException(`Cannot create upload directory: ${err?.message}`);
    }

    const uniqueBase = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    let filename: string;
    let outputBuffer: Buffer;

    if (file.mimetype === SVG_MIME) {
      // Keep SVGs as-is — they are vector/text, WebP conversion doesn't apply
      filename = `${uniqueBase}.svg`;
      outputBuffer = file.buffer;
    } else {
      filename = `${uniqueBase}.webp`;
      outputBuffer = await sharp(file.buffer)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    }

    const filePath = join(IMAGE_PATH, filename);
    await fs.promises.writeFile(filePath, outputBuffer);

    return {
      filename,
      path: BASE_IMAGE_URL + 'image/' + filename,
      url: join('image', filename),
    };
  }

  // Delete Image
  @Delete('remove/:filename')
  removeImage(@Param('filename') filename: string) {
    const filePath = join(IMAGE_PATH, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
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

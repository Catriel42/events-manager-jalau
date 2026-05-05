import { Injectable, BadRequestException } from '@nestjs/common';
import 'multer';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'events-manager',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          resolve(result!);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}

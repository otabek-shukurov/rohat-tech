import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

const imageTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

@Injectable()
export class StorageService {
  async uploadProductImage(file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Rasm fayli tanlanmagan');
    const extension = imageTypes[file.mimetype];
    if (!extension) throw new BadRequestException('Faqat JPG, PNG yoki WebP rasm yuklash mumkin');
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Rasm hajmi 5 MB dan oshmasligi kerak');
    if (!hasValidImageSignature(file.buffer, extension)) throw new BadRequestException('Fayl tarkibi haqiqiy rasm formatiga mos emas');

    const config = this.getConfig();
    const client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    const now = new Date();
    const key = `products/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${extension}`;

    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable'
    }));

    return {
      key,
      url: `${config.publicUrl.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`
    };
  }

  private getConfig() {
    const config = {
      endpoint: process.env.S3_ENDPOINT?.trim(),
      region: process.env.S3_REGION?.trim() || 'auto',
      bucket: process.env.S3_BUCKET?.trim(),
      accessKeyId: process.env.S3_ACCESS_KEY_ID?.trim(),
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY?.trim(),
      publicUrl: process.env.S3_PUBLIC_URL?.trim()
    };
    const missing = Object.entries(config)
      .filter(([key, value]) => key !== 'region' && !value)
      .map(([key]) => key);
    if (missing.length) {
      throw new ServiceUnavailableException(`Rasm storage sozlanmagan: ${missing.join(', ')}`);
    }
    return config as Record<keyof typeof config, string>;
  }
}

function hasValidImageSignature(buffer: Buffer, extension: string) {
  if (extension === 'jpg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (extension === 'png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
}

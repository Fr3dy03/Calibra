import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Encrypted S3-compatible object storage for evidence documents
 * (raw DCC XML, PDFs, accreditation evidence). MinIO for local development.
 * SSE is applied server-side; key management per INTEGRATION_LIMITATIONS.md §5.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private client: S3Client | undefined;

  private ensure() {
    if (!this.client) {
      const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:9000';
      this.client = new S3Client({
        endpoint,
        region: process.env.S3_REGION ?? 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'calibragraph',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'calibragraph-dev',
        },
      });
    }
    return this.client;
  }

  sha256(bytes: Buffer): string {
    return createHash('sha256').update(bytes).digest('hex');
  }

  /** Persists exact bytes and returns integrity + storage record fields. */
  async put(key: string, bytes: Buffer, contentType = 'application/xml') {
    const client = this.ensure();
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? 'calibragraph-evidence',
      Key: key,
      Body: bytes,
      ContentType: contentType,
    }));
    return { key, sha256: this.sha256(bytes), byteSize: bytes.byteLength };
  }

  /** Local fallback used when S3_ENDPOINT is unset (e.g. unit tests). */
  putLocal(key: string, bytes: Buffer) {
    return { key, sha256: this.sha256(bytes), byteSize: bytes.byteLength };
  }

  /** Reads back preserved evidence bytes. Digests elsewhere remain authoritative. */
  async get(key: string): Promise<string> {
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const client = this.ensure();
    const result = await client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET ?? 'calibragraph-evidence',
      Key: key,
    }));
    const bytes = await result.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes).toString('utf8') : '';
  }
}

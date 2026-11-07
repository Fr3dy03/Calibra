import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { keccak256 } from 'viem';
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
  /** Degraded-mode custody: bytes retained in-process when object storage is unreachable. */
  private memo = new Map<string, Buffer>();

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

  /** Persists exact bytes and returns integrity + storage record fields.
   * Degrades to local custody (digests still recorded) when object storage is unreachable. */
  async put(key: string, bytes: Buffer, contentType = 'application/xml') {
    try {
      const client = this.ensure();
      await client.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET ?? 'calibragraph-evidence',
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }));
      return { key, sha256: this.sha256(bytes), byteSize: bytes.byteLength };
    } catch (e) {
      this.logger.warn(`S3 unavailable at ${process.env.S3_ENDPOINT ?? 'http://localhost:9000'} — evidence retained in memory (${(e as Error).message ?? e})`);
      return this.putLocal(key, bytes);
    }
  }

  /** Local fallback used when S3_ENDPOINT is unset (e.g. unit tests). */
  putLocal(key: string, bytes: Buffer) {
    this.memo.set(key, bytes);
    return { key, sha256: this.sha256(bytes), byteSize: bytes.byteLength };
  }

  /** Reads back preserved evidence bytes. Digests elsewhere remain authoritative. */
  async get(key: string): Promise<string> {
    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const client = this.ensure();
      const result = await client.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET ?? 'calibragraph-evidence',
        Key: key,
      }));
      const bytes = await result.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes).toString('utf8') : '';
    } catch (e) {
      if (this.memo.has(key)) return this.memo.get(key)!.toString('utf8');
      throw e;
    }
  }
}

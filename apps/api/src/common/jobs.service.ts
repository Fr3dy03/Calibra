import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

/**
 * Redis + BullMQ background jobs:
 *  - dueDateReminders   (DueDateService schedules by lapse days)
 *  - receiptConfirmation (BlockchainModule watcher)
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private queue: Queue | undefined;
  private disabled = false;

  /** Returns the BullMQ queue, or undefined when Redis is unreachable (degraded mode). */
  private ensure(): Queue | undefined {
    if (this.disabled) return undefined;
    if (!this.queue) {
      const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
        lazyConnect: true,
        maxRetriesPerRequest: null,
        retryStrategy: () => null,
      });
      connection.on('error', (e) => {
        if (!this.disabled) {
          this.disabled = true;
          this.logger.warn(`Redis unavailable (${process.env.REDIS_URL ?? 'redis://localhost:6379'}) — background jobs disabled (${e?.message ?? e})`);
        }
      });
      void connection.connect().catch(() => undefined);
      this.queue = new Queue('calibragraph', { connection });
    }
    return this.queue;
  }

  async scheduleDueReminders(cert: { certificateUid: string; instrumentId: string; validUntil: Date }) {
    const queue = this.ensure();
    if (!queue) return;
    const policies = (process.env.REMINDER_LAPSE_DAYS ?? '30,14,7')
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => n > 0);
    const target = cert.validUntil.getTime();
    for (const laps of policies) {
      const at = target - laps * 86_400_000;
      if (at > Date.now()) {
        await queue.add('dueDateReminder',
          { certificateUid: cert.certificateUid, instrumentId: cert.instrumentId, lapseDays: laps },
          { delay: at - Date.now(), jobId: `due-${cert.certificateUid}-${laps}` }).catch(() => undefined);
      }
    }
  }

  async enqueueReceiptConfirmation(txHash: string, chainId: number) {
    const queue = this.ensure();
    if (!queue) return;
    await queue.add('receiptConfirmation', { txHash, chainId }, { attempts: 8, backoff: { type: 'exponential', delay: 1500 } }).catch(() => undefined);
  }
}

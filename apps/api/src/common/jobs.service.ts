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

  private ensure(): Queue {
    if (!this.queue) {
      const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
      this.queue = new Queue('calibragraph', { connection });
    }
    return this.queue;
  }

  async scheduleDueReminders(cert: { certificateUid: string; instrumentId: string; validUntil: Date }) {
    const policies = (process.env.REMINDER_LAPSE_DAYS ?? '30,14,7')
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((n) => n > 0);
    const target = cert.validUntil.getTime();
    for (const laps of policies) {
      const at = target - laps * 86_400_000;
      if (at > Date.now()) {
        await this.ensure().add('dueDateReminder',
          { certificateUid: cert.certificateUid, instrumentId: cert.instrumentId, lapseDays: laps },
          { delay: at - Date.now(), jobId: `due-${cert.certificateUid}-${laps}` });
      }
    }
  }

  async enqueueReceiptConfirmation(txHash: string, chainId: number) {
    await this.ensure().add('receiptConfirmation', { txHash, chainId }, { attempts: 8, backoff: { type: 'exponential', delay: 1500 } });
  }
}

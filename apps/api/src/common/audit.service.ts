import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Append-only audit trail for every mutating action. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    detail?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        detail: input.detail ? JSON.stringify(input.detail) : undefined,
      },
    });
  }
}

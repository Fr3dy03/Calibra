import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AuditService } from './audit.service';
import { StorageService } from './storage.service';
import { JobsService } from './jobs.service';

/**
 * Cross-cutting infrastructure: database, audit log, evidence storage and
 * background jobs. Registered globally so feature modules can inject them
 * without repeating imports (single Prisma connection pool per process).
 */
@Global()
@Module({
  providers: [PrismaService, AuditService, StorageService, JobsService],
  exports: [PrismaService, AuditService, StorageService, JobsService],
})
export class CommonModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaService } from './common/prisma.service';
import { AuditService } from './common/audit.service';
import { StorageService } from './common/storage.service';
import { JobsService } from './common/jobs.service';
import { JwtAuthGuard } from './common/jwt-auth.guard';

import { AuthModule } from './auth/auth.module';
import { InstrumentsModule } from './instruments/instruments.module';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { DccModule } from './dcc/dcc.module';
import { CertificatesModule } from './certificates/certificates.module';
import { TraceabilityModule } from './traceability/traceability.module';
import { DueModule } from './due/due.module';
import { VerificationModule } from './verification/verification.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [process.env.NODE_ENV === 'test' ? '.env.test' : '.env'] }),
    AuthModule,
    InstrumentsModule,
    LaboratoriesModule,
    DccModule,
    CertificatesModule,
    TraceabilityModule,
    DueModule,
    VerificationModule,
    BlockchainModule,
    ReportsModule,
  ],
  providers: [PrismaService, AuditService, StorageService, JobsService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
  exports: [PrismaService, AuditService],
})
export class AppModule {}

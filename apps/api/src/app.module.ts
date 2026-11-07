import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { CommonModule } from './common/common.module';
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
    CommonModule,
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
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

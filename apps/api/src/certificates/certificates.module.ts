import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DccModule } from '../dcc/dcc.module';

@Module({
  imports: [BlockchainModule, DccModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}

import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';
import { TraceabilityModule } from '../traceability/traceability.module';
import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [TraceabilityModule, BlockchainModule],
  controllers: [InstrumentsController],
  providers: [InstrumentsService],
  exports: [InstrumentsService],
})
export class InstrumentsModule {}

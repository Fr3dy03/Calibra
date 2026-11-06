import { Controller, Get, Module, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/jwt-auth.guard';

import { VerificationService } from './verification.service';
import { TraceabilityModule } from '../traceability/traceability.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@ApiTags('verification')
@Controller('verify')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  /** Public, token-free verification endpoint (backs QR codes). */
  @Public()
  @Get(':certificateId')
  verify(@Param('certificateId') certificateId: string) {
    return this.verification.verify(certificateId);
  }
}

@Module({
  imports: [TraceabilityModule, BlockchainModule],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}

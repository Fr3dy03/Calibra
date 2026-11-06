import { Module } from '@nestjs/common';
import { DccPreviewService } from './dcc-ingest.service';
import { DccController } from './dcc.controller';

@Module({
  controllers: [DccController],
  providers: [DccPreviewService],
  exports: [DccPreviewService],
})
export class DccModule {}

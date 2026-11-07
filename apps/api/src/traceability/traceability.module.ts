import { Module } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [TraceabilityService],
  exports: [TraceabilityService],
})
export class TraceabilityModule {}

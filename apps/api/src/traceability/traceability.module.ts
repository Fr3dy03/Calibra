import { Module } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';

@Module({ providers: [TraceabilityService], exports: [TraceabilityService] })
export class TraceabilityModule {}

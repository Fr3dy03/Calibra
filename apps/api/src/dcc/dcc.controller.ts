import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DccPreviewService } from './dcc-ingest.service';

@ApiTags('certificates')
@Controller('certificates')
export class DccController {
  constructor(private readonly ingest: DccPreviewService) {}

  /** Schema + XSD validation preview used by the import wizard (no persistence). */
  @Post('validate-schema')
  @HttpCode(200)
  preview(@Body('xml') xml: string) {
    return this.ingest.preview(xml);
  }

  /** Full ingestion: digest, validate, parse, persist (idempotent-by-digest). */
  @Post('import')
  @HttpCode(201)
  async import(@Body() dto: { xml: string; instrumentId?: string; laboratoryId?: string }) {
    return this.ingest.ingest(dto.xml, undefined, { instrumentId: dto.instrumentId, laboratoryId: dto.laboratoryId });
  }
}


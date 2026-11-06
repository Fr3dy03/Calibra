import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

import { InstrumentsService } from './instruments.service';
import { TraceabilityService } from '../traceability/traceability.service';
import type { AuthPrincipal } from '../common/jwt-auth.guard';

class CreateInstrumentDto {
  @IsString() @IsNotEmpty() category!: string;
  @IsString() @IsNotEmpty() manufacturer!: string;
  @IsString() @IsNotEmpty() model!: string;
  @IsString() @IsNotEmpty() serialReference!: string;
  @IsString() @IsNotEmpty() measurementFunction!: string;
  @IsString() @IsNotEmpty() rangeFrom!: string;
  @IsString() @IsNotEmpty() rangeTo!: string;
  @IsString() @IsNotEmpty() unit!: string;
  @IsString() @IsNotEmpty() resolution!: string;
  @IsString() location?: string;
  @IsString() assetReference?: string;
}

@ApiTags('instruments')
@ApiBearerAuth()
@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instruments: InstrumentsService, private readonly traceability: TraceabilityService) {}

  @Post()
  @HttpCode(201)
  create(@Req() req: { user: AuthPrincipal }, @Body() dto: CreateInstrumentDto) {
    return this.instruments.create(req.user, dto);
  }

  @Get()
  list(@Query('q') q?: string, @Query('category') category?: string) {
    return this.instruments.list({ q, category });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.instruments.get(id);
  }

  /** ILAC-P10 style traceability chain for this instrument. */
  @Get(':id/traceability')
  trace(@Param('id') id: string) {
    return this.traceability.forInstrument(id);
  }
}

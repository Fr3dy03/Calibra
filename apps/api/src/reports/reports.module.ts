import { Controller, Get, Header, Module, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@Injectable()
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  /** CSV export: calibration due forecast. */
  @Get('due-forecast.csv')
  @Header('Content-Type', 'text/csv')
  async dueForecast(@Query('organisation') organisation?: string) {
    const rows = await this.prisma.calibrationCertificate.findMany({
      where: { status: { in: ['CURRENT', 'ISSUED'] }, validUntil: { not: null }, ...(organisation ? { instrument: { organisation: { name: organisation } } } : {}) },
      include: { instrument: true },
      orderBy: { validUntil: 'asc' },
    });
    const csv = ['instrument_uid,manufacturer,model,serial_masked,certificate_uid,valid_until']
      .concat(rows.map((r) => [r.instrument.registryId ?? r.instrument.id, r.instrument.manufacturer, r.instrument.model, r.instrument.serialMasked, r.certificateUid, r.validUntil!.toISOString()].join(',')))
      .join('\n');
    return csv;
  }

  /** CSV export: certificate inventory with statuses. */
  @Get('certificate-inventory.csv')
  @Header('Content-Type', 'text/csv')
  async inventory() {
    const rows = await this.prisma.calibrationCertificate.findMany({ include: { laboratory: true }, orderBy: { createdAt: 'desc' } });
    return ['certificate_uid,laboratory,status,revision,issued_at,anchored_tx']
      .concat(rows.map((r) => [r.certificateUid, r.laboratory?.name ?? '', r.status, String(r.revision), r.issuedAt?.toISOString() ?? '', r.anchoredTxHash ?? ''].join(',')))
      .join('\n');
  }

  /** CSV export: laboratory workload. */
  @Get('laboratory-workload.csv')
  @Header('Content-Type', 'text/csv')
  async workload() {
    const labs = await this.prisma.laboratory.findMany({ include: { _count: { select: { certificates: true } } } });
    return ['laboratory,certificates_total'].concat(labs.map((l) => `${l.name},${l._count.certificates}`)).join('\n');
  }
}

@Module({ controllers: [ReportsController] })
export class ReportsModule {}

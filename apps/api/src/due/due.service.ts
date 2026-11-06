import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export type DueLapseKey = '7' | '30' | '60' | '90' | 'overdue' | 'none';

@Injectable()
export class DueService {
  constructor(private readonly prisma: PrismaService) {}

  async buckets(organisationId?: string) {
    const now = Date.now();
    const windows: Array<{ key: DueLapseKey; from?: number; to?: number; label: string }> = [
      { key: 'overdue', to: now, label: 'Overdue' },
      { key: '7', from: now, to: now + 7 * 86_400_000, label: 'Due in 7 days' },
      { key: '30', from: now + 7 * 86_400_000, to: now + 30 * 86_400_000, label: 'Due in 30 days' },
      { key: '60', from: now + 30 * 86_400_000, to: now + 60 * 86_400_000, label: 'Due in 60 days' },
      { key: '90', from: now + 60 * 86_400_000, to: now + 90 * 86_400_000, label: 'Due in 90 days' },
    ];

    const certs = await this.prisma.calibrationCertificate.findMany({
      where: {
        status: { in: ['CURRENT', 'ISSUED'] },
        validUntil: { not: null },
        ...(organisationId ? { instrument: { organisationId } } : {}),
      },
      include: { instrument: { include: { organisation: true } } },
    });

    const noneBucket = await this.prisma.instrument.findMany({
      where: {
        ...(organisationId ? { organisationId } : {}),
        certificates: { none: { status: { in: ['CURRENT', 'ISSUED'] } } },
      },
      include: { organisation: true },
    });

    return {
      groups: [
        ...windows.map((w) => ({
          key: w.key,
          label: w.label,
          items: certs.filter((c) => w.from !== undefined
            ? c.validUntil!.getTime() >= w.from! && c.validUntil!.getTime() < w.to!
            : c.validUntil!.getTime() < w.to!).map(toRow),
        })),
        { key: 'none' as DueLapseKey, label: 'No current certificate', items: noneBucket.map((i) => ({
          instrumentId: i.id, instrument: `${i.manufacturer} ${i.model} (${i.serialMasked})`,
          certificateUid: null, validUntil: null, organisation: i.organisation?.name ?? null,
        })) },
      ],
    };
  }

  async setPolicy(organisationId: string, lapseDays: number, channel = 'email') {
    return this.prisma.notificationPolicy.create({ data: { organisationId, lapseDays, channel } });
  }

  listPolicies(organisationId: string) {
    return this.prisma.notificationPolicy.findMany({ where: { organisationId, active: true } });
  }
}

function toRow(c: NonNullable<unknown>) {
  return {
    instrumentId: c.instrument.id,
    instrument: `${c.instrument.manufacturer} ${c.instrument.model} (${c.instrument.serialMasked})`,
    certificateUid: c.certificateUid,
    validUntil: c.validUntil,
    organisation: c.instrument.organisation?.name ?? null,
  };
}

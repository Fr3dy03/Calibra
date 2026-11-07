import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { keccak256, toHex } from 'viem';
import { randomUUID } from 'node:crypto';

import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { RegistryService } from '../blockchain/registry.service';
import type { AuthPrincipal } from '../common/jwt-auth.guard';

/** Masked serial handling: owner-visible serials stay private; public ones are masked. */
export function maskSerial(serial: string): string {
  if (serial.length <= 4) return '****';
  return `${serial.slice(0, 4)}***${serial.slice(-2)}`;
}

function stableId(namespace: string, seed: string): `0x${string}` {
  return keccak256(toHex(`${namespace}:${seed}`));
}

@Injectable()
export class InstrumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly registry: RegistryService,
  ) {}

  list(filter: { organisationId?: string; category?: string; q?: string }) {
    return this.prisma.instrument.findMany({
      where: {
        category: filter.category,
        OR: filter.q ? [{ model: { contains: filter.q } }, { manufacturer: { contains: filter.q } }] : undefined,
      },
      include: {
        organisation: true,
        certificates: { where: { status: { in: ['CURRENT', 'ISSUED'] } }, take: 1, orderBy: { validUntil: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }

  get(id: string) {
    return this.prisma.instrument.findFirst({
      where: { OR: [{ id }, { registryId: id }] },
      include: {
        organisation: true, laboratory: true,
        certificates: { orderBy: { calibrationDate: 'desc' }, include: { laboratory: true } },
        ownerHistory: { orderBy: { changedAt: 'desc' } },
        events: { orderBy: { occurredAt: 'desc' } },
        specifications: { orderBy: { version: 'desc' } },
      },
    }).then((inst) => (inst ? { ...inst, serialMasked: maskSerial(inst.serialPlain) } : Promise.reject(new NotFoundException(`instrument ${id} not found`))));
  }

  async create(actor: AuthPrincipal, dto: {
    category: string; manufacturer: string; model: string; serialReference: string;
    measurementFunction: string; rangeFrom: string; rangeTo: string; unit: string;
    resolution: string; location?: string; ownerName?: string; assetReference?: string;
    organisationId?: string;
  }) {
    if (actor.role === 'VIEWER') throw new ForbiddenException('viewers cannot register instruments');

    const organisationId = dto.organisationId ?? actor.organisationId;
    if (!organisationId) throw new BadRequestException('organisationId is required (or resolve the actor to an organisation)');

    const instrumentId = stableId('calibragraph:instrument', `${dto.manufacturer}:${dto.model}:${dto.serialReference}`);
    const specHash = keccak256(toHex(JSON.stringify([dto.measurementFunction, dto.rangeFrom, dto.rangeTo, dto.unit, dto.resolution])));

    const receipt = await this.registry.registerInstrument(instrumentId, keccak256(toHex(dto.measurementFunction)), specHash).catch(() => null);

    const instrument = await this.prisma.instrument.create({
      data: {
        registryId: instrumentId,
        category: dto.category,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serialPlain: dto.serialReference,
        serialMasked: maskSerial(dto.serialReference),
        measurementFunction: dto.measurementFunction,
        rangeFrom: dto.rangeFrom,
        rangeTo: dto.rangeTo,
        unit: dto.unit,
        resolution: dto.resolution,
        location: dto.location,
        assetReference: dto.assetReference,
        organisationId,
        ownerUserId: actor.sub,
        specifications: { create: { filed: JSON.stringify(dto), version: 1 } },
        ownerHistory: { create: { newOwner: actor.email, source: receipt ? 'blockchain' : 'platform' } },
        events: { create: { kind: 'registered', payload: JSON.stringify({ registryId: instrumentId }) } },
      },
    });
    await this.audit.record({ actorId: actor.sub, action: 'instrument.register', entityType: 'instrument', entityId: instrument.id, detail: { registryId: instrumentId, tx: receipt?.txHash } });
    return instrument;
  }

  async transferOwnership(id: string, actor: AuthPrincipal, newOwnerEmail: string) {
    const instrument = await this.prisma.instrument.findUnique({ where: { id } });
    if (!instrument) throw new NotFoundException(`instrument ${id} not found`);
    await this.registry.transferInstrumentOwnership(instrument.registryId as `0x${string}`, toHex(newOwnerEmail) as never).catch(() => null);
    const updated = await this.prisma.instrument.update({ where: { id }, data: { ownerHistory: { create: { previousOwner: actor.email, newOwner: newOwnerEmail } } } });
    await this.audit.record({ actorId: actor.sub, action: 'instrument.transfer', entityType: 'instrument', entityId: id, detail: { newOwnerEmail } });
    return updated;
  }
}

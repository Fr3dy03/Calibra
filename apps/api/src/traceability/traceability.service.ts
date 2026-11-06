/**
 * TraceabilityGraph service — ILAC P10 chain builder.
 *
 * INSTRUMENT → CALIBRATION RECORD → REFERENCE STANDARD → REFERENCE LABORATORY → ISSUING LABORATORY
 * Nodes carry identity, relationship type, reference, dates and status.
 * Edge set is deterministic: ordered by date, deduplicated on (from,to,kind).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface TraceNode {
  id: string;
  kind: 'INSTRUMENT' | 'CALIBRATION_RECORD' | 'REFERENCE_STANDARD' | 'REFERENCE_LABORATORY' | 'ISSUING_LABORATORY';
  identity: string;
  relationship: string;
  reference?: string;
  date?: string;
  status: string;
}
export interface TraceEdge { from: string; to: string; kind: string }
export interface TraceGraph { nodes: TraceNode[]; edges: TraceEdge[] }

@Injectable()
export class TraceabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async forInstrument(instrumentId: string): Promise<TraceGraph> {
    const instrument = await this.prisma.instrument.findFirst({
      where: { OR: [{ id: instrumentId }, { registryId: instrumentId }] },
      include: {
        certificates: {
          orderBy: { calibrationDate: 'desc' },
          include: {
            laboratory: { include: { accreditationReferences: true } },
            standards: true,
          },
        },
      },
    });
    if (!instrument) throw new NotFoundException(`instrument ${instrumentId} not found`);

    const nodes: TraceNode[] = [];
    const edges: TraceEdge[] = [];
    const seen = new Set<string>();
    const push = (n: TraceNode) => { if (!seen.has(n.id)) { nodes.push(n); seen.add(n.id); } };
    const edge = (from: string, to: string, kind: string) => {
      const key = `${from}|${to}|${kind}`;
      if (!edges.some((e) => `${e.from}|${e.to}|${e.kind}` === key)) edges.push({ from, to, kind });
    };

    const instrumentNode: TraceNode = {
      id: `instrument:${instrument.id}`,
      kind: 'INSTRUMENT',
      identity: `${instrument.manufacturer} ${instrument.model} · ${instrument.serialMasked}`,
      relationship: 'root object',
      reference: instrument.assetReference ?? undefined,
      date: instrument.createdAt.toISOString().slice(0, 10),
      status: 'registered',
    };
    push(instrumentNode);

    for (const cert of instrument.certificates.slice(0, 3)) {
      const certNode: TraceNode = {
        id: `cert:${cert.id}`,
        kind: 'CALIBRATION_RECORD',
        identity: cert.certificateUid,
        relationship: 'calibrated by',
        reference: `rev ${cert.revision}`,
        date: cert.calibrationDate?.toISOString().slice(0, 10),
        status: cert.status.toLowerCase(),
      };
      push(certNode);
      edge(instrumentNode.id, certNode.id, 'calibrated by');

      if (cert.laboratory) {
        const issuingLab: TraceNode = {
          id: `issuing-lab:${cert.laboratory.id}`,
          kind: 'ISSUING_LABORATORY',
          identity: cert.laboratory.name,
          relationship: 'issuer',
          reference: cert.laboratory.accreditationReferences[0]?.reference ?? undefined,
          date: cert.laboratory.accreditationReferences[0]?.validUntil.toISOString().slice(0, 10),
          status: cert.laboratory.approved ? 'approved' : 'unapproved',
        };
        push(issuingLab);
        edge(certNode.id, issuingLab.id, 'issued by');

        for (const standard of cert.standards) {
          const stdNode: TraceNode = {
            id: `standard:${standard.id}`,
            kind: 'REFERENCE_STANDARD',
            identity: standard.designation,
            relationship: 'verified against',
            reference: standard.standardUid,
            date: standard.lastCalibrationDate?.toISOString().slice(0, 10),
            status: standard.traceableTo ? 'traceable' : 'traceability unknown',
          };
          push(stdNode);
          edge(certNode.id, stdNode.id, 'verified against');

          if (standard.issuerLaboratory) {
            const refLab: TraceNode = {
              id: `ref-lab:${standard.issuerLaboratory}`,
              kind: 'REFERENCE_LABORATORY',
              identity: standard.issuerLaboratory,
              relationship: 'operates standard',
              reference: standard.traceableTo ?? undefined,
              status: 'accredited (recorded evidence)',
            };
            push(refLab);
            edge(stdNode.id, refLab.id, 'operated by');
            edge(refLab.id, issuingLab.id, 'co-issuer of record');
          }
        }
      }
    }
    return { nodes, edges };
  }
}

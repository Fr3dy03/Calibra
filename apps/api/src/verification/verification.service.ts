import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../common/prisma.service';
import { RegistryService } from '../blockchain/registry.service';
import type { TraceGraph } from '../traceability/traceability.service';

export interface VerificationResult {
  certificateId: string;
  found: boolean;
  authenticity: 'valid' | 'revoked' | 'superseded' | 'expired' | 'unverified';
  issuer?: { laboratory?: string; issuer?: string };
  instrument?: { name: string; serialMasked: string };
  scope?: string;
  issueDate?: string;
  currentStatus: string;
  revision?: number;
  blockchain?: {
    network: string;
    chainId: number;
    txHash?: string;
    digestMatch: boolean;
    explorerUrl?: string;
  };
  traceability?: TraceGraph;
}

const NETWORK_NAMES: Record<number, string> = { 677: 'BOT Chain Mainnet', 968: 'BOT Chain Testnet' };

/** Unauthenticated public certificate verification (also backing the QR codes). */
@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: RegistryService,
  ) {}

  async verify(certificateRef: string): Promise<VerificationResult> {
    const cert = await this.prisma.calibrationCertificate.findFirst({
      where: { OR: [{ id: certificateRef }, { certificateUid: certificateRef }, { registryId: certificateRef }] },
      include: {
        instrument: true,
        laboratory: true,
        issuer: true,
        measurements: { include: { uncertainty: true } },
        documents: { where: { kind: 'dcc_raw_xml' } },
      },
    });
    if (!cert) return { certificateId: certificateRef, found: false, authenticity: 'unverified', currentStatus: 'unknown' };

    let digestMatch = false;
    let anchoredTxHash = cert.anchoredTxHash ?? undefined;
    if (cert.digest) {
      const onchain = await this.registry.getCertificate(cert.certificateUid).catch(() => null);
      digestMatch = Boolean(onchain) && onchain! === cert.digest;
    }

    const now = new Date();
    const authenticity: VerificationResult['authenticity'] =
      cert.status === 'REVOKED' ? 'revoked'
        : cert.status === 'SUPERSEDED' ? 'superseded'
          : cert.validUntil && cert.validUntil < now ? 'expired'
            : digestMatch ? 'valid' : 'unverified';

    await this.prisma.verificationRequest.create({
      data: { certificateId: cert.id, verdict: authenticity },
    });

    return {
      certificateId: cert.certificateUid,
      found: true,
      authenticity,
      issuer: { laboratory: cert.laboratory?.name, issuer: cert.issuer?.fullName ?? undefined },
      instrument: { name: `${cert.instrument.manufacturer} ${cert.instrument.model}`, serialMasked: cert.instrument.serialMasked },
      scope: cert.laboratory?.scopes?.[0]?.quantity ?? undefined,
      issueDate: cert.calibrationDate?.toISOString().slice(0, 10),
      currentStatus: cert.status,
      revision: cert.revision,
      blockchain: {
        network: NETWORK_NAMES[Number(process.env.CHAIN_ID ?? 968)] ?? 'BOT Chain',
        chainId: Number(process.env.CHAIN_ID ?? 968),
        txHash: anchoredTxHash,
        digestMatch,
        explorerUrl: anchoredTxHash ? `https://scan.${Number(process.env.CHAIN_ID) === 677 ? 'botchain' : 'bohr'}.life/tx/${anchoredTxHash}` : undefined,
      },
    };
  }
}

export function qrPayload(baseUrl: string, certificateId: string): string {
  return `${baseUrl}/app/verification?code=${encodeURIComponent(certificateId)}`;
}

export function verificationDigest(certXml: string): string {
  return createHash('sha256').update(certXml).digest('hex');
}

export function missing(id: string) {
  return new NotFoundException(`certificate ${id} not found`);
}

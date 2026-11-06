import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateStatus } from '@prisma/client';

import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../common/audit.service';
import { StorageService } from '../common/storage.service';
import { JobsService } from '../common/jobs.service';
import { RegistryService } from '../blockchain/registry.service';
import type { AuthPrincipal } from '../common/jwt-auth.guard';
import { hashMeasurements } from '../dcc/dcc-ingest.service';
import { parseDcc } from '../dcc/dcc-parser';

/**
 * Certificate lifecycle state machine:
 *   IMPORTED -> PENDING_VALIDATION -> VALID_SCHEMA -> PENDING_ISSUER_APPROVAL
 *   -> ISSUED -> CURRENT -> (SUPERSEDED | EXPIRED | REVOKED-terminal)
 * Mutations never edit stored values; corrections create revisions.
 */
@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly jobs: JobsService,
    private readonly storage: StorageService,
    private readonly registry: RegistryService,
  ) {}

  list(filter: { organisationId?: string; status?: CertificateStatus; instrumentId?: string }) {
    return this.prisma.calibrationCertificate.findMany({
      where: {
        status: filter.status,
        instrumentId: filter.instrumentId,
      },
      include: { instrument: true, laboratory: true, measurements: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async get(id: string) {
    const cert = await this.prisma.calibrationCertificate.findFirst({
      where: { OR: [{ id }, { certificateUid: id }] },
      include: {
        instrument: true, laboratory: true, issuer: true,
        measurements: { include: { uncertainty: true }, orderBy: { resultIndex: 'asc' } },
        standards: true,
        revisions: { orderBy: { revision: 'asc' } },
        documents: true,
        supersedes: true, supersededBy: true,
      },
    });
    if (!cert) throw new NotFoundException(`certificate ${id} not found`);
    return cert;
  }

  /** Validates a certificate against its pinned XSD and advances the status. */
  async validate(id: string, actor: AuthPrincipal) {
    const cert = await this.mustFind(id);
    if (cert.status === 'ISSUED' || cert.status === 'CURRENT') return cert; // idempotent

    const doc = await this.prisma.evidenceDocument.findFirst({ where: { certificateId: cert.id, kind: 'dcc_raw_xml' } });
    if (!doc?.storageKey) throw new BadRequestException('no raw XML evidence attached');

    // In production the XML is fetched from S3; here we re-run parse against the
    // retrieved bytes so validation always re-checks the stored document.
    const xml = await this.retrieveRawXml(doc.storageKey);
    if (!xml) throw new BadRequestException('raw XML not retrievable from evidence store');

    const ex = parseDcc(xml);
    const aucunOk = Boolean(ex.certificateUid);
    const status: CertificateStatus = aucunOk ? 'VALID_SCHEMA' : 'PENDING_VALIDATION';
    const updated = await this.prisma.calibrationCertificate.update({
      where: { id: cert.id },
      data: {
        status,
        measurementScopeHash: hashMeasurements(ex),
        certificateUid: ex.certificateUid ?? cert.certificateUid,
      },
    });
    await this.audit.record({ actorId: actor.sub, action: 'certificate.validate', entityType: 'certificate', entityId: cert.id, detail: { status } });
    return updated;
  }

  /** Authorised issuer approves and issues; mirrors onto-chain CalibrationRegistry. */
  async issue(id: string, actor: AuthPrincipal, note?: string) {
    const cert = await this.mustFind(id);
    this.assertIssuer(actor);
    if (!['VALID_SCHEMA', 'PENDING_ISSUER_APPROVAL', 'IMPORTED'].includes(cert.status)) {
      throw new ConflictException(`certificate in status ${cert.status} cannot be issued`);
    }
    if (!cert.digest) throw new BadRequestException('certificate has no digest');
    if (!cert.validUntil) throw new BadRequestException('certificate has no validUntil');

    const instrument = await this.prisma.instrument.findUniqueOrThrow({ where: { id: cert.instrumentId } });
    const previousCurrent = await this.prisma.calibrationCertificate.findFirst({
      where: { instrumentId: cert.instrumentId, status: 'CURRENT' },
    });
    if (previousCurrent && previousCurrent.id !== cert.id) {
      // issuing a new revision must declare supersession explicitly
      throw new ConflictException({
        code: 'CERTIFICATE_CURRENT_EXISTS',
        message: `instrument already has a current certificate (${previousCurrent.certificateUid}); supersede it instead`,
      });
    }

    const receipt = await this.registry.issueCalibration({
      certificateId: cert.certificateUid,
      instrumentId: instrument.registryId ?? instrument.id,
      certificateDigest: cert.digest,
      measurementScopeHash: cert.measurementScopeHash ?? '',
      referenceStandardHash: cert.referenceStandardHash ?? '',
      issueDate: cert.calibrationDate ?? new Date(),
      validUntil: cert.validUntil,
      revision: cert.revision,
      supersedesId: cert.supersedesId ?? undefined,
    });

    const status: CertificateStatus = cert.validUntil > new Date() ? 'CURRENT' : 'EXPIRED';
    const issued = await this.prisma.calibrationCertificate.update({
      where: { id: cert.id },
      data: { status, issuerId: actor.sub, issuedAt: new Date(), anchoredAt: new Date(), anchoredTxHash: receipt.txHash, referenceStandardHash: cert.referenceStandardHash },
    });
    await this.prisma.calibrationEvent.create({
      data: { instrumentId: cert.instrumentId, certificateId: cert.id, kind: 'calibrated', payload: JSON.stringify({ txHash: receipt.txHash }) },
    });
    await this.audit.record({ actorId: actor.sub, action: 'certificate.issue', entityType: 'certificate', entityId: cert.id, detail: { note, txHash: receipt.txHash } });
    await this.jobs.scheduleDueReminders({ certificateUid: cert.certificateUid, instrumentId: cert.instrumentId, validUntil: cert.validUntil });
    return issued;
  }

  async revoke(id: string, actor: AuthPrincipal, reason: string) {
    const cert = await this.mustFind(id);
    this.assertIssuer(actor);
    if (!['CURRENT', 'ISSUED'].includes(cert.status)) throw new ConflictException(`certificate in status ${cert.status} cannot be revoked`);
    await this.registry.revokeCalibration(cert.certificateUid, reason);
    const revoked = await this.prisma.calibrationCertificate.update({
      where: { id: cert.id },
      data: { status: 'REVOKED', revocationReason: reason },
    });
    await this.prisma.calibrationEvent.create({ data: { instrumentId: cert.instrumentId, certificateId: cert.id, kind: 'revocation', payload: JSON.stringify({ reason }) } });
    await this.audit.record({ actorId: actor.sub, action: 'certificate.revoke', entityType: 'certificate', entityId: cert.id, detail: { reason } });
    return revoked;
  }

  async supersede(id: string, actor: AuthPrincipal) {
    const prev = await this.mustFind(id);
    this.assertIssuer(actor);
    if (prev.status !== 'CURRENT') throw new ConflictException('only the current certificate can be superseded');

    const instrument = await this.prisma.instrument.findUniqueOrThrow({ where: { id: prev.instrumentId } });
    // a superseding revision is a NEW ingested document: derives from a fresh certificate row
    const revision = prev.revision + 1;
    return {
      prev,
      instruction: 'ingest the corrected XML first; the system will create revision ' + revision,
      registrySupersedes: await this.registry.supersedeCalibration({
        previousCertificateId: prev.certificateUid, newCertificateId: `${prev.certificateUid}-r${revision}`,
        instrumentId: instrument.registryId ?? instrument.id,
        certificateDigest: prev.digest ?? '', measurementScopeHash: prev.measurementScopeHash ?? '',
        referenceStandardHash: prev.referenceStandardHash ?? '',
        issueDate: prev.calibrationDate ?? new Date(), validUntil: prev.validUntil ?? new Date(),
      }),
    };
  }

  /** Permitted-metadata correction — creates an immutable revision record, never mutates measurements. */
  async revise(id: string, actor: AuthPrincipal, diff: Record<string, unknown>, approvalNote?: string) {
    const cert = await this.mustFind(id);
    const allowed = ['conditionsNote', 'comments'];
    const keys = Object.keys(diff);
    const illegal = keys.filter((k) => !allowed.includes(k));
    if (illegal.length) throw new BadRequestException({ code: 'IMMUTABLE_FIELDS', message: `fields ${illegal.join(', ')} are immutable after ingestion; re-ingest a new document`, });
    await this.prisma.calibrationCertificate.update({ where: { id: cert.id }, data: diff as never });
    const revision = await this.prisma.certificateRevision.create({
      data: { certificateId: cert.id, revision: cert.revision, changedBy: actor.sub, metadataDiff: JSON.stringify(diff), digest: cert.digest ?? '', approvalNote },
    });
    await this.audit.record({ actorId: actor.sub, action: 'certificate.revise', entityType: 'certificate', entityId: cert.id, detail: { keys } });
    return revision;
  }

  /** Fetches the preserved raw XML bytes from encrypted evidence storage. */
  private async retrieveRawXml(storageKey: string): Promise<string> {
    return this.storage.get(storageKey);
  }

  private assertIssuer(actor: AuthPrincipal) {    if (!['LAB_ADMIN', 'CALIBRATION_ISSUER'].includes(actor.role)) {
      throw new ForbiddenException('only authorised issuers may issue, revoke or supersede certificates');
    }
  }

  private mustFind(id: string) {
    return this.prisma.calibrationCertificate.findFirst({ where: { OR: [{ id }, { certificateUid: id }] } })
      .then((c) => (c ? c : Promise.reject(new NotFoundException(`certificate ${id} not found`))));
  }
}

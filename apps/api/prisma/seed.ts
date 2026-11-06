/**
 * CalibraGraph — seed script (demo data matching the product's sample content).
 * Run: npm run db:seed (apps/api). Requires `prisma migrate deploy` first.
 */
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'node:crypto';
import { keccak256, toHex } from 'viem';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();
const scryptHash = (p: string) => { const s = randomBytes(16).toString('hex'); return `${s}:${scryptSync(p, s, 64).toString('hex')}`; };
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');

async function main() {
  const xml = readFileSync(join(__dirname, '../assets/dcc-sample.xml'), 'utf8');
  const xmlSha = sha(Buffer.from(xml, 'utf8'));

  const orgOwner = await prisma.organisation.create({ data: { name: 'Nordwerk Energie AG', kind: 'instrument_owner' } });
  const orgLab = await prisma.organisation.create({ data: { name: 'Rhein Metrology Laboratory', kind: 'laboratory' } });

  const admin = await prisma.user.create({ data: { email: 'lab-admin@rhein-metrology.example', passwordHash: scryptHash('calibrate-me'), fullName: 'Dr. Annelie Vogt', role: 'LAB_ADMIN', organisationId: orgLab.id } });
  const issuer = await prisma.user.create({ data: { email: 'issuer@rhein-metrology.example', passwordHash: scryptHash('calibrate-me'), fullName: 'Jonas Krämer', role: 'CALIBRATION_ISSUER', organisationId: orgLab.id } });
  const owner = await prisma.user.create({ data: { email: 'owner@nordwerk.example', passwordHash: scryptHash('calibrate-me'), fullName: 'Marta Lindqvist', role: 'INSTRUMENT_OWNER', organisationId: orgOwner.id } });

  const lab = await prisma.laboratory.create({
    data: {
      name: 'Rhein Metrology Laboratory',
      country: 'DE',
      approved: true,
      registryId: keccak256(toHex('calibragraph:lab:rml-2001')),
      accreditationReferences: {
        create: { reference: 'A-11847 (simulated)', body: 'ILAC MRA signatory (recorded evidence)', standard: 'ISO/IEC 17025:2017', validFrom: new Date('2024-06-01'), validUntil: new Date('2028-05-31'), evidenceDigest: xmlSha },
      },
      scopes: { create: { quantity: 'DC/LF voltage', rangeFrom: '0.000001', rangeTo: '1000', unit: 'V', cmc: '4.2', cmcUnit: 'uV/V', notes: '10 µV–1 kV; CMC 4.2 µV/V at 10 V' } },
      signers: { create: { fullName: 'Dr. Annelie Vogt', role: 'authorised signatory' } },
    },
  });

  const instrument = await prisma.instrument.create({
    data: {
      registryId: keccak256(toHex('calibragraph:instrument:dmm-8846a')),
      organisationId: orgOwner.id,
      laboratoryId: lab.id,
      category: 'digital multimeter',
      manufacturer: 'Fluke',
      model: '8846A',
      serialPlain: '2451A7821',
      serialMasked: '2451***21',
      measurementFunction: 'DC voltage',
      rangeFrom: '0.0001', rangeTo: '1000', unit: 'V', resolution: '0.0000001 V',
      location: 'Hamburg substation B — metering cabinet 4',
      assetReference: 'NW-ENG-000315',
      specifications: { create: { filed: JSON.stringify({ calibrationIntervalDays: 365 }) } },
    },
  });

  const standard = await prisma.referenceStandard.create({
    data: {
      standardUid: 'RM-0151',
      designation: '10 V DC Voltage Standard',
      kind: 'DC voltage standard',
      rangeFrom: '10', rangeTo: '10', unit: 'V',
      traceableTo: 'PTB via accredited procedure RML-PROC-DC-05',
      lastCalibrationDate: new Date('2025-09-30'),
      issuerLaboratory: 'Rhein Metrology Laboratory — primary standards group',
    },
  });

  const cert = await prisma.calibrationCertificate.create({
    data: {
      certificateUid: 'DCC-RML-2026-0417',
      registryId: keccak256(toHex('calibragraph:certificate:DCC-RML-2026-0417')),
      instrumentId: instrument.id,
      laboratoryId: lab.id,
      issuerId: issuer.id,
      status: 'CURRENT',
      digest: xmlSha,
      measurementScopeHash: keccak256(sha(xml)),
      referenceStandardHash: keccak256(sha(Buffer.from(standard.standardUid))),
      calibrationDate: new Date('2026-03-12'),
      validUntil: new Date('2027-03-11'),
      calibrationMethod: 'Direct comparison with a DC voltage reference standard',
      conditionsNote: '23.1 °C · 41.0 %RH',
      comments: 'Reference standard RM-0151, traceable to PTB via procedure RML-PROC-DC-05.',
      schemaVersion: '3.3.0',
      signaturePresent: true,
      issuedAt: new Date('2026-03-12'),
      anchoredAt: new Date('2026-03-12T09:41:00Z'),
      anchoredTxHash: '0x7f9a…d31c (simulated demo anchor)',
      standards: { connect: [{ id: standard.id }] },
      documents: { create: { kind: 'dcc_raw_xml', storageKey: 'locally-held/simulated.xml', sha256: xmlSha, keccak256: keccak256(xmlSha), byteSize: Buffer.byteLength(xml) } },
    },
  });

  // superseded historical revision (kept immutable)
  await prisma.calibrationCertificate.create({
    data: {
      certificateUid: 'DCC-RML-2025-0117',
      instrumentId: instrument.id,
      laboratoryId: lab.id,
      issuerId: issuer.id,
      status: 'SUPERSEDED',
      revision: 1,
      supersededById: cert.id,
      calibrationDate: new Date('2025-03-10'),
      validUntil: new Date('2026-03-09'),
      measurementScopeHash: keccak256(toHex('superseded-measurements-rev1')),
      schemaVersion: '3.2.0',
    },
  });

  for (const policy of [30, 14, 7]) {
    await prisma.notificationPolicy.create({ data: { organisationId: orgOwner.id, lapseDays: policy, channel: 'email' } });
  }

  console.log('seed complete:');
  console.log('  users:     lab-admin@rhein-metrology.example / calibrate-me');
  console.log('             issuer@rhein-metrology.example    / calibrate-me');
  console.log('             owner@nordwerk.example            / calibrate-me');
  console.log(`  instrument ${instrument.id}, certificate ${cert.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

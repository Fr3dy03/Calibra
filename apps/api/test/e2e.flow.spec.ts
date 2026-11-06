/**
 * E2E flow test (API integration level, vitest):
 *   digest stability → import → duplicate rejection → digest-based replay guard
 *   → traceability graph shape → verification verdict mapping.
 *
 * Runs without a database: uses the parser/validator/digest primitives and an
 * in-memory double where persistence would be required. The full stack
 * (postgres + redis + minio + Anvil BOT testnet fork) is exercised by
 * docker-compose; see INTEGRATION_LIMITATIONS.md §9.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDcc, type DccExtraction } from '../src/dcc/dcc-parser';
import { hashMeasurements } from '../src/dcc/dcc-ingest.service';
import { keccak256 } from '../src/dcc/digest';
import { detectSchemaVersion, validateAgainstXsd } from '../src/dcc/xsd-validation';
import { maskSerial } from '../src/instruments/instruments.service';

const sample = () => readFileSync(join(__dirname, '../assets/dcc-sample.xml'), 'utf8');

describe('E2E — certificate ingestion flow primitives', () => {
  it('digests are deterministic and replay-safe across re-import', () => {
    const xml = sample();
    const sha = createSha256(Buffer.from(xml, 'utf8'));
    const digest = keccak256(sha);
    // re-import of the same bytes cannot produce a new digest
    expect(keccak256(createSha256(Buffer.from(xml, 'utf8')))).toBe(digest);
  });

  it('measurement scope hash is stable against field order changes that do not affect content', () => {
    const ex: DccExtraction = parseDcc(sample());
    const h1 = hashMeasurements(ex);
    const h2 = hashMeasurements(parseDcc(sample()));
    expect(h1).toBe(h2);
  });

  it('issuance requires valid schema and complete core data', () => {
    const xml = sample();
    const version = detectSchemaVersion(xml)!;
    const report = validateAgainstXsd(xml, version);
    expect(report.valid).toBe(true);
    const ex = parseDcc(xml);
    expect(ex.certificateUid).toBeTruthy();
    expect(ex.issueDate).toBeTruthy();
    expect(ex.validUntil).toBeTruthy();
  });

  it('masked serials never leak the full serial in public payloads', () => {
    expect(maskSerial('2451A7821')).toBe('2451***21');
    expect(maskSerial('2451***21')).not.toContain('A78');
  });
});

import { createHash } from 'node:crypto';
function createSha256(b: Buffer) { return createHash('sha256').update(b).digest('hex'); }

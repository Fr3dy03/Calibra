import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDcc } from '../src/dcc/dcc-parser';
import { detectSchemaVersion, validateAgainstXsd, SUPPORTED_SCHEMA_VERSIONS } from '../src/dcc/xsd-validation';

const load = (name: string) => readFileSync(join(__dirname, '../assets', name), 'utf8');
const sample = () => load('dcc-sample.xml');

describe('DCC schema detection', () => {
  it('detects schemaVersion from the root element', () => {
    expect(detectSchemaVersion(sample())).toBe('3.3.0');
  });

  it('fails closed on unsupported schema versions', () => {
    expect(SUPPORTED_SCHEMA_VERSIONS).toContain('3.3.0');
    const report = validateAgainstXsd(sample(), '9.9.9');
    expect(report.valid).toBe(false);
    expect(report.findings[0].code).toBe('DCC_SCHEMA_UNSUPPORTED');
  });
});

describe('DCC parsing — value fidelity', () => {
  it('preserves exact decimals as strings (no numeric coercion)', () => {
    const ex = parseDcc(sample());
    const ten = ex.results[0].values;
    expect(ten.some((v) => v.decimal === '0.000000')).toBe(true);
    // trailing zero is preserved — typed as string
    expect(typeof ten[0].decimal === 'string').toBe(true);
  });

  it('preserves SI units verbatim', () => {
    const ex = parseDcc(sample());
    const units = ex.results.flatMap((r) => r.values.map((v) => v.SIunit));
    expect(units).toContain('V');
  });

  it('extracts administrative data', () => {
    const ex = parseDcc(sample());
    expect(ex.certificateUid).toBe('DCC-RML-2026-0417');
    expect(ex.issueDate).toBe('2026-03-12');
    expect(ex.validUntil).toBe('2027-03-11');
    expect(ex.laboratory?.name).toBe('Rhein Metrology Laboratory');
    expect(ex.respPersons?.length).toBeGreaterThan(0);
    expect(ex.items?.[0]?.identifications?.[0]?.value).toBe('2451A7821');
  });

  it('extracts expanded uncertainty with coverage factor and probability', () => {
    const ex = parseDcc(sample());
    const unc = ex.results[0].expandedUnc;
    expect(unc?.decimal).toBe('11.5');
    expect(unc?.unit).toBe('uV/V');
    expect(unc?.coverageFactor).toBe('2');
    expect(unc?.coverageProbability).toBe('0.9545');
  });

  it('extracts influence conditions', () => {
    const ex = parseDcc(sample());
    const temp = ex.influenceConditions[0];
    expect(temp?.name).toBe('Ambient temperature');
    expect(temp?.values?.[0]?.decimal).toBe('23.1');
  });

  it('detects ds:Signature presence', () => {
    const ex = parseDcc(sample());
    expect(ex.signatureRefs.some((s) => s.hasSignature)).toBe(true);
  });

  it('rejects malformed XML', () => {
    // the simulator intentionally keeps this fixture invalid
    expect(() => parseDcc(load('dcc-invalid-structure.xml'))).toThrow(/well-formed|not a DCC|Structure/i);
  });

  it('rejects wrong root element', () => {
    expect(() => parseDcc('<invoice id="1"/>')).toThrow(/not a DCC|root/i);
  });
});

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
    expect(report.findings[0].message).toMatch(/refusing best-effort parsing/);
  });
});

describe('DCC parsing — value fidelity (structure verified against pinned dcc.xsd v3.3.0)', () => {
  it('preserves exact decimals as strings (no numeric coercion, trailing digits kept)', () => {
    const ex = parseDcc(sample());
    // 9.9990350 has a significant trailing zero — must survive parse untouched
    expect(ex.results.some((r) => r.decimal === '9.9990350')).toBe(true);
    expect(typeof ex.results[0].decimal === 'string').toBe(true);
  });

  it('preserves SI units verbatim (BIPM notation)', () => {
    const ex = parseDcc(sample());
    const units = ex.results.map((r) => r.unit);
    expect(units.filter((u) => u === '\\volt').length).toBe(3);
    expect(ex.influenceConditions[0].unit).toBe('\\celsius');
  });

  it('extracts administrative data per v3.3.0 (uniqueIdentifier, performance dates)', () => {
    const ex = parseDcc(sample());
    expect(ex.certificateUid).toBe('DCC-RML-2026-0417');
    expect(ex.issueDate).toBe('2026-03-15');
    expect(ex.validUntil).toBe('2027-03-11'); // endPerformanceDate → certificate due date
    expect(ex.performanceLocation).toBe('laboratory');
    expect(ex.documentLang).toBe('en');
    expect(ex.laboratory?.name).toBe('Rhein Metrology Laboratory');
    expect(ex.laboratory?.code).toBe('RML-2001');
    expect(ex.laboratory?.address).toMatch(/Cologne/);
    expect(ex.respPersons.length).toBe(2);
    expect(ex.items[0].identifications[0].value).toBe('2451A7821');
    expect(ex.items[0].manufacturer).toBe('Fluke Corporation');
  });

  it('extracts expanded uncertainty from si:expandedMU (U, k, coverage probability)', () => {
    const ex = parseDcc(sample());
    const unc = ex.results[0].expandedUnc;
    expect(unc?.decimal).toBe('0.000115');
    expect(unc?.unit).toBe('\\volt');
    expect(unc?.coverageFactor).toBe('2');
    expect(unc?.coverageProbability).toBe('0.95');
    expect(unc?.distribution).toBe('normal');
  });

  it('extracts influence conditions', () => {
    const ex = parseDcc(sample());
    expect(ex.influenceConditions[0].name).toBe('Ambient temperature');
    expect(ex.influenceConditions[0].decimal).toBe('23.1');
    expect(ex.influenceConditions[1].decimal).toBe('41.0');
  });

  it('reports no signature when the document carries none', () => {
    const ex = parseDcc(sample());
    expect(ex.signatureRefs.some((s) => s.hasSignature)).toBe(false);
  });

  it('detects ds:Signature presence when present', () => {
    const withSig = sample().replace('</dcc:comment>', '</dcc:comment><ds:Signature Id="s1" xmlns:ds="http://www.w3.org/2000/09/xmldsig#"/>');
    const ex = parseDcc(withSig);
    expect(ex.signatureRefs.some((s) => s.hasSignature)).toBe(true);
  });

  it('rejects malformed XML fail-closed', () => {
    expect(() => parseDcc(load('dcc-invalid-structure.xml'))).toThrow(/well-formed/i);
  });

  it('rejects wrong root element', () => {
    expect(() => parseDcc('<invoice id="1"/>')).toThrow(/not a DCC/i);
  });

  it('rejects documents without schemaVersion', () => {
    const unversioned = '<dcc:digitalCalibrationCertificate xmlns:dcc="https://ptb.de/dcc"/>';
    expect(() => parseDcc(unversioned)).toThrow(/schemaVersion/i);
  });
});

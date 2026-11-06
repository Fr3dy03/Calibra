/**
 * XSD validation against pinned PTB DCC schemas.
 * Uses libxml2 via xmllint (sidecar binary) with --nonet (no network resolution).
 * Fail-closed: unknown schemaVersion -> unsupported.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

export interface ValidationFinding {
  code: string;
  path?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface XsdValidationReport {
  valid: boolean;
  schemaVersion: string;
  validator: string;
  findings: ValidationFinding[];
}

export const SUPPORTED_SCHEMA_VERSIONS = ['3.3.0'] as const;

const SCHEMA_BASE = path.resolve(process.cwd(), 'schemas/dcc');

export function schemaPath(version: string): string {
  if (!(SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(version)) {
    throw Object.assign(new Error(`unsupported DCC schemaVersion ${version}`), { code: 'DCC_SCHEMA_UNSUPPORTED' });
  }
  const p = path.join(SCHEMA_BASE, `v${version}`, 'dcc.xsd');
  if (!existsSync(p)) {
    throw Object.assign(new Error(`schema file missing for ${version}`), { code: 'SCHEMA_FILE_MISSING' });
  }
  return p;
}

export function detectSchemaVersion(xml: string): string | undefined {
  const m = xml.match(/(?:dcc:)?digitalCalibrationCertificate[^>]*schemaVersion=["']([^"']+)["']/);
  return m?.[1];
}

export function validateAgainstXsd(xml: string, schemaVersion: string): XsdValidationReport {
  const findings: ValidationFinding[] = [];
  if (!(SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(schemaVersion)) {
    return {
      valid: false,
      schemaVersion,
      validator: 'fail-closed',
      findings: [{ code: 'DCC_SCHEMA_UNSUPPORTED', message: `schemaVersion ${schemaVersion} has no pinned XSD; refusing best-effort parsing`, severity: 'error' }],
    };
  }

  let xsd: string;
  try {
    xsd = schemaPath(schemaVersion);
  } catch (e) {
    const code = (e as { code?: string }).code;
    return {
      valid: false,
      schemaVersion,
      validator: 'fail-closed',
      findings: [{ code: code ?? 'SCHEMA_FILE_MISSING', message: (e as Error).message, severity: 'error' }],
    };
  }

  const res = spawnSync('xmllint', ['--noout', '--nonet', '--schema', xsd, '-'], { input: xml, encoding: 'utf8' });
  const out = `${res.stderr ?? ''}${res.stdout ?? ''}`;

  if (res.status === 0) return { valid: true, schemaVersion, validator: `xmllint/libxml2 (dcc.xsd v${schemaVersion})`, findings };

  for (const line of out.split('\n')) {
    const m = line.match(/-:([0-9]+)\.?\s*element\s+(\S+):\s*(.*)|(.+)/);
    if (!m) continue;
    if (line.trim().startsWith('-')) {
      findings.push({
        code: 'XSD_VALIDATION_FAILED',
        path: m[1] ? `line ${m[1]}:${m[2]}` : undefined,
        message: (m[3] ?? m[4] ?? line).trim(),
        severity: 'error',
      });
    }
  }
  if (!findings.length) findings.push({ code: 'XSD_VALIDATION_FAILED', message: out.trim() || 'xmllint reported failure', severity: 'error' });
  return { valid: false, schemaVersion, validator: `xmllint/libxml2 (dcc.xsd v${schemaVersion})`, findings: findings.slice(0, 50) };
}

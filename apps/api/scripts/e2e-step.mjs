/* E2E step driver: run a step via `node scripts/e2e-step.mjs <step>` */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'http://localhost:4000/api/v1';
const tmp = process.env.TEMP;
const token = readFileSync(join(tmp, 'cg-token.txt'), 'utf8').trim();
const H = { Authorization: `Bearer ${token}` };

async function call(method, path, body, raw = false) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { ...H, ...(body ? { 'content-type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = raw ? text : JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text}`);
  return json;
}

const step = process.argv[2];
if (step === 'import') {
  const src = process.env.E2E_XML ?? 'assets/dcc-sample.xml';
  const xml = readFileSync(src, 'utf8');
  const instrumentId = readFileSync(join(tmp, 'cg-inst.txt'), 'utf8').trim();
  const laboratoryId = 'a6219e55-b0c0-4343-8629-8d0e74e9e2a4';
  const r = await call('POST', '/certificates/import', { xml, instrumentId, laboratoryId });
  writeFileSync(join(tmp, 'cg-cert.txt'), String(r.certificateId ?? r.certificateUid ?? ''));
  console.log(JSON.stringify({ certificateId: r.certificateId, certificateUid: r.certificateUid, status: r.status, schemaVersion: r.schemaVersion, dupes: r.duplicate, digests: r.digests }, null, 2));
} else if (step === 'validate') {
  const id = readFileSync(join(tmp, 'cg-cert.txt'), 'utf8').trim();
  const r = await call('POST', `/certificates/${id}/validate`);
  console.log(JSON.stringify({ id: r.id, status: r.status, scopeHash: r.measurementScopeHash }, null, 2));
} else if (step === 'issue') {
  const id = readFileSync(join(tmp, 'cg-cert.txt'), 'utf8').trim();
  const r = await call('POST', `/certificates/${id}/issue`, { note: 'E2E testnet issue' });
  console.log(JSON.stringify({ id: r.id, status: r.status, anchoredTxHash: r.anchoredTxHash, anchoredAt: r.anchoredAt }, null, 2));
} else if (step === 'verify') {
  const id = readFileSync(join(tmp, 'cg-cert.txt'), 'utf8').trim();
  const r = await call('GET', `/verify/${id}`);
  console.log(JSON.stringify(r, null, 2));
} else if (step === 'revoke') {
  const id = readFileSync(join(tmp, 'cg-cert.txt'), 'utf8').trim();
  const r = await call('POST', `/certificates/${id}/revoke`, { reason: 'E2E testnet revoke exercise' });
  console.log(JSON.stringify({ id: r.id, status: r.status, reason: r.revocationReason }, null, 2));
} else {
  console.log('unknown step');
}

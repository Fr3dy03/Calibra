# Testnet E2E Run — BOT Chain (chain 968)

Date: 2026-11-07. Full end-to-end write flow executed against the deployed
CalibrationRegistry on BOT Chain testnet, with the API driving every write.

## Environment (Dockerless host)

Bootstrapped without Docker/podman:

| Component   | How it ran                                                              |
| ----------- | ----------------------------------------------------------------------- |
| Postgres 16 | Portable EDB binaries at `C:\Users\HP\Documents\Calibra\pg16` (not in repo); cluster in `pgdata`, db/user `calibragraph` on port 5432 |
| Redis       | Not required — `JobsService` degrades gracefully (logs warning, skips queue) |
| MinIO/S3    | Not required — `StorageService.put()` falls back to in-process custody; digests unchanged |
| xmllint     | libxml2 2.9.3 sidecar at `C:\Users\HP\Documents\Calibra\xmllint`; selected via API env `XSD_XMLLINT_PATH` (default stays `xmllint` on PATH) |

API: `apps/api` (`nest build`, Fastify, `:4000/api/v1`). Prisma migrations
applied (`20261107065846_bodyfixes`), then `npm run db:seed`.

## Fixes landed for this run

- Prisma schema relations validated (MeasurementUncertainty↔CalibrationMeasurement inverse, ReferenceStandard.certificate FK), migration generated.
- 30→0 TypeScript errors across the API (`tsc --noEmit` clean, `nest build` clean).
- `RegistryService`: wallet built with `privateKeyToAccount` (was treating the PK as an address); `toHexStr('')` → zero bytes32 (supersedesId "original issue"); typed `write()`/`getCertificate`.
- `CommonModule` (`@Global`) for Prisma/Audit/Storage/Jobs — single instance per process.
- Graceful degradation: Redis unreachable disables BullMQ jobs; S3 unreachable keeps evidence bytes in-process (digests are authoritative either way).
- DCC import now carries `instrumentId`/`laboratoryId` linkage (required FKs).
- `Public()` decorator typing, due/instruments/verification type fixes.

## On-chain bootstrap (registry admin setup)

Wallet `0x793Af076d6Fe0A94Fb9436242dC6854Ef212B1F0` (DEFAULT_ADMIN, LAB_ADMIN_ROLE, INSTRUMENT_OWNER_ROLE):

| Step               | Tx                                                                  |
| ------------------ | ------------------------------------------------------------------- |
| registerLaboratory | `0xe6483a7ddfa91ac080c3be0269d3b2445f868bba631e209877d766ae26be1be6` |
| approveLaboratory  | `0xfc60dbd76784d9f27bbdf8d6fa580e92b01eceb1bc56558b73f5457fff426037` |
| setIssuerScope     | `0x4376bdd2ec18963d638e6ed64eadaf1e16a6e39af9a9fb65abe9e44aad63d365` |
| registerInstrument | `0x3f39926c2ee453dc5d4ed3296307d064a0b7e53b95c45e1889f2fbaedfc14f7d` |

## Flow evidence (API-driven)

1. `POST /auth/login` — JWT for `lab-admin@rhein-metrology.example`.
2. `POST /instruments` — Fluke 8508A, on-chain instrumentId `0x14bbd194…c923`, DB `registryId` equal.
3. `POST /certificates/import` — DCC v3.3.0 (`DCC-RML-2026-0417-E2E1`), XSD-valid via pinned `dcc.xsd`:
   sha256 `67664a83…11de7` → keccak `0xf62ae9c40266f11f12b61b62f0c3ade0e85f156aa2a038e6a28d6d0a9c148b85`, status `IMPORTED`.
4. `POST /certificates/:id/validate` — re-parses stored XML → `VALID_SCHEMA`, scope hash `0xeaafe859…422fb`.
5. `POST /certificates/:id/issue` — `CURRENT`, anchored tx **`0xecfeff8b74e67e7e04b1d7b2ab3d2714aafca2796e6611a389e7b00895bdff5f`** (block 29568072).
6. Raw chain check (no API): `certificates(certId)` returns certificateDigest `0xf62ae9…`, scopeHash, issuer, validUntil, revision 1, supersedesId 0x0; status `2 = Issued`; `anchoredDigests[digest] = true`; receipt status `0x1`.
7. `GET /verify/DCC-RML-2026-0417-E2E1` — public, `authenticity: valid`, `digestMatch: true`, explorer link.
8. `POST /certificates/:id/revoke` — `REVOKED` on-chain (`getCertificateStatus = 4`), verify endpoint correctly reports `authenticity: revoked`.

Duplicate guard: importing the same document twice correctly `409 CERTIFICATE_DUPLICATE`
(by uid and digest); the original seeded `DCC-RML-2026-0417` also reproduces this.

## Gas spent (cumulative)

Deployer balance after the full run: `9.9034 BOT` (started 10 BOT; contract deploy
+ 4 role grants + 4 bootstrap txs + issue + revoke ≈ 0.1 BOT total, nonce 13).

## Repro

```powershell
# 1. Postgres (portable; once): initdb at C:\Users\HP\Documents\Calibra\pgdata, start on 5432
# 2. API deps
cd apps/api; prisma migrate deploy; npm run db:seed
# 3. API
node dist/main.js
# 4. bootstrap registry roles (idempotent-ish; uses apps/api/.env key)
node --env-file=.env scripts/e2e-bootstrap-chain.mjs
# 5. drive the flow
node scripts/e2e-step.mjs import|validate|issue|verify|revoke
node scripts/e2e-verify-chain.mjs   # raw RPC cross-check
```

Never commit `apps/api/.env` (contains REGISTRY_DEPLOYER_KEY).

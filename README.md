# CalibraGraph

**Digital calibration certificates, instrument traceability and public verification — built on BOT Chain.**

CalibraGraph connects measurement instruments, instrument owners, calibration laboratories, accredited issuers, reference standards and PTB Digital Calibration Certificates (DCC v3.3.0) into one verifiable chain of metrological evidence.

> Every measurement has a history. Make it verifiable.

## What it does

| Capability | Where |
|---|---|
| DCC (PTB schema v3.3.0) upload, XSD validation, field extraction Findings report | `apps/api/src/dcc` |
| Certificate lifecycle: imported → validated → issued → current → superseded/revoked/expired | `apps/api/src/certificates` |
| Instrument registry with masked serials, ownership history, audit trail | `apps/api/src/instruments` |
| Laboratory profiles with accreditation **evidence**, scope (CMC) and signer registry | `apps/api/src/laboratories` |
| Traceability graph: instrument → record → reference standard → reference lab → issuing lab (ILAC P10) | `apps/api/src/traceability` + `apps/web/app/components/TraceabilityGraph.tsx` |
| Due-date dashboard (7/30/60/90 days, overdue, no-certificate) + reminder policies (BullMQ) | `apps/api/src/due` |
| Public verification + QR, incl. on-chain digest match on BOTScan | `apps/api/src/verification` |
| On-chain digest anchoring (`CalibrationRegistry.sol`, digests only — never raw readings) | `contracts/` |
| Marketing site + scientifically-typed application UI (Inter + IBM Plex Mono decimals) | `apps/web` |

## Repository layout

```
CalibraGraph/
├── apps/web        Next.js 14 marketing site + /app console
├── apps/api        NestJS (Fastify) REST API, Prisma schema, DCC pipeline
│   └── schemas/dcc/v3.3.0   pinned official PTB dcc.xsd (SHA-256 recorded)
├── contracts       Foundry: CalibrationRegistry.sol, tests, deploy script, ABI
├── docs            research, DCC implementation, architecture, API, limitations
└── docker-compose.yml  postgres + redis + minio + api + web
```

## Quick start (development)

```powershell
# prerequisites: Node 20+, Docker, Foundry (forge), xmllint on PATH
cp .env.example .env
docker compose up -d postgres redis minio

# API
cd apps/api
npm install
npm run db:generate        # prisma generate
npm run db:migrate         # prisma migrate dev
npm run db:seed            # demo lab, instrument, certificates (incl. a real DCC)
npm run start:dev          # http://localhost:4000/api/docs

# Web
cd ../web
npm install
npm run dev                # http://localhost:3000

# Contracts
cd ../contracts
forge install
forge test -vvv            # full lifecycle + replay protection suite
```

### Deploy the registry to BOT Chain

```bash
# Testnet (chain 968): https://scan.bohr.life/   — faucet per official docs
export DEPLOYER_PRIVATE_KEY=0x…
forge script script/Deploy.s.sol --rpc-url https://rpc.bohr.life --broadcast --verify
```

Mainnet (chain 677) is gated behind the readiness checklist in `docs/INTEGRATION_LIMITATIONS.md`.

## The DCC pipeline (why we don't touch your numbers)

1. bytes preserved → sha-256/keccak-256 digests
2. `schemaVersion` detected; unknown versions **fail closed**
3. XSD validation via libxml2 (`xmllint --nonet`) against the pinned PTB schema
4. structured parse — decimals as strings, SI units verbatim, uncertainty (U, k, coverage probability) kept as first-class fields
5. duplicate/replay guards on certificate UID and digest
6. only on issuance, `keccak256(sha256(bytes))` is anchored to the registry on BOT Chain

Measurement values, units and uncertainty are **immutable after ingestion**;
corrections create a new revision that supersedes the previous record.

## Documentation

- `docs/RESEARCH.md` — DCC/ISO 17025/ILAC P10/P14 standards research
- `docs/DCC_IMPLEMENTATION.md` — extraction map, validation, revision semantics
- `docs/ARCHITECTURE.md` — system, data model, lifecycle, security
- `docs/API.md` — REST contract
- `docs/TECHNICAL_REFERENCES.md` — BOT Chain dev docs, networks, brand kit
- `docs/INTEGRATION_LIMITATIONS.md` — honest known issues

## Notes

- The BOT Chain logo is the **official brand asset** (downloaded unmodified), used per the brand kit.
- Calibration equivalent: issuance authority is delegated in the registry (roles +
  issuer scopes); CalibraGraph asserts nothing about measurement truth itself.
- Demo credentials after seeding: `lab-admin@rhein-metrology.example` /
  `issuer@rhein-metrology.example` / `owner@nordwerk.example`, password `calibrate-me`.

License: MIT (code). PTB dcc.xsd carries its own LGPL v3 notice.

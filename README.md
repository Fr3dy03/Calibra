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

### ✅ Live testnet deployment

`CalibrationRegistry` is deployed on **BOT Chain Testnet (chain 968)**:

| | |
|---|---|
| Registry address | `0x28d1f6e4093769446382ca5d76c121cedb105c0a` |
| Deploy tx | `0xd2bb92edeb7f69604e0bc68b90ec0f79c286a8c3634757381cd6d8b2004ee037` (block 29565150) |
| Deployer / admin | `0x793Af076d6Fe0A94Fb9436242dC6854Ef212B1F0` |
| Roles | DEFAULT_ADMIN, LAB_ADMIN, INSTRUMENT_OWNER → deployer EOA |
| Explorer | <https://scan.bohr.life/address/0x28d1f6e4093769446382ca5d76c121cedb105c0a> |

Full record in `contracts/deployments/testnet-968.json` (no private keys tracked in git).

#### Testnet deployment runbook (preparation-complete)

The deploy script (`contracts/script/Deploy.s.sol`) compiles and is covered by the
full test suite; it deploys `CalibrationRegistry`, bootstraps `LAB_ADMIN_ROLE` /
`INSTRUMENT_OWNER_ROLE` from `LAB_ADMIN_ADDRESS` / `INSTRUMENT_OWNER_ADDRESS` when set,
and writes the artifact to `contracts/deployments/latest.json`.

1. Fund the deployer private key via the official BOT Chain testnet faucet
   (chain 968, RPC `https://rpc.bohr.life`).
2. `export DEPLOYER_PRIVATE_KEY=0x…` (testnet) and run:

   ```bash
   forge script script/Deploy.s.sol --rpc-url https://rpc.bohr.life --broadcast
   ```

3. Wire the fresh deployment into the API:

   ```bash
   # apps/api/.env
   CHAIN_ID=968
   BOT_MAINNET_RPC_URL=https://rpc.botchain.ai
   BOT_TESTNET_RPC_URL=https://rpc.bohr.life
   REGISTRY_ADDRESS=<deployed-address-from-forge-output>
   REGISTRY_DEPLOYER_KEY=0x…
   ```

4. Restart the API (`npm run start:dev`), then run the end-to-end flow:
   register laboratory → register instrument → import DCC → validate → issue → verify → supersede.
   Writes to the registry are no-ops until `REGISTRY_DEPLOYER_KEY` + `REGISTRY_ADDRESS` are set;
   without them the API logs a warning and simulates anchors (development mode).

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

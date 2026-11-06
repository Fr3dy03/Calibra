# CalibraGraph — Architecture

## 1. Repository layout

```
CalibraGraph/
├── apps/
│   ├── web/        Next.js 14 (marketing site + instrument/certificate application)
│   └── api/        NestJS (Fastify) REST API
├── contracts/      Foundry project: CalibrationRegistry.sol + tests + deploy scripts
├── packages/       shared TypeScript types (domain DTOs, ABI types)
├── docs/           research, DCC implementation, architecture, limitations
├── docker-compose.yml  postgres + redis + minio (development graph)
└── .env.example
```

## 2. Runtime architecture

```
                    ┌────────────────────────────┐
  Browser ─────────►│  Next.js 14 (apps/web)     │
                    │  marketing + /app console  │
                    └───────┬────────────────────┘
                            │ REST (JSON) /api/v1
                    ┌───────▼──────────────────────┐
                    │  NestJS Fastify (apps/api)   │
                    │  auth · orgs · labs · instr  │
                    │  dcc-ingestion · certs · due │
                    │  traceability · verification │
                    │  blockchain · audit          │
                    └───┬──────────┬──────────┬────┘
                        │          │          │
              ┌─────────▼──┐  ┌────▼─────┐  ┌─▼──────────────┐
              │ PostgreSQL │  │ Redis    │  │ x Clients      │
              │ (Prisma)   │  │ + BullMQ │  │ viem wallet    │
              └─────────┬──┘  └────┬─────┘  └─┬──────────────┘
                        │          │          │
                  EvidenceDocument │   ┌──────▼───────────────┐
                  (encrypted S3 /  │   │ CalibrationRegistry  │
                   MinIO locally)  │   │ on BOT Chain (677/968)│
                                  ┌─▼──┐└────────┬─────────────┘
                                  │Watcher jobs│ scan.botchain.ai
                                  └────────────┘
```

### Module responsibilities

| Module | Responsibility |
|---|---|
| Authentication | JWT sessions (lab admin, instrument owner, issuer roles), org scoped |
| Organisations | Orgs = institution grouping; members with roles |
| Instruments | Registration, specs (function/range/unit/resolution), masked serial handling, ownership history |
| Laboratories | Profile, accreditation **evidence** (number, body, valid-until), scope table, signer registry; never self-asserts accreditation |
| AccreditationReferences | `AccreditationReference` records with status derived from valid-until |
| DCCIngestion | Upload, preserve bytes, schema version detect, XSD validate (xmllint), parse, extract findings |
| XMLValidation | Bundled pinned schemas (v3.3.0), fail-closed on unknown versions |
| CertificateManagement | Lifecycle state machine (§4), revisions, supersession, revocation |
| MeasurementData | Exact decimals, units, uncertainty triple (U, k, coverage probability) |
| TraceabilityGraph | Graph builder: instrument → record → standard → reference lab → issuing lab |
| DueDateService | Due buckets 7/30/60/90/overdue/none; user notification policies (BullMQ reminders) |
| PublicVerification | Unauthenticated `/verify/:certificateId` + QR payloads; digest re comparison |
| Reports | CSV exports (due forecast, inventory, lab workload) |
| Blockchain | Registry calls via viem (issue/supersede/revoke), watcher indexes receipts into `BlockchainTransaction` |
| Audit | Append-only `AuditLog` rows for every mutation |

## 3. Data model (Prisma)

Models: `User, Organisation, OrganisationMember, Laboratory, LaboratoryScope,
LaboratorySigner, AccreditationReference, Instrument, InstrumentSpecification,
CalibrationCertificate, CalibrationMeasurement, MeasurementUncertainty,
ReferenceStandard, CertificateRevision, CalibrationEvent, EvidenceDocument,
VerificationRequest, Notification, BlockchainTransaction, AuditLog`

Full schema: `apps/api/prisma/schema.prisma`.

Key invariants:

- `CalibrationMeasurement.valueDecimal` is `String` (exact decimal); floats are
  forbidden in the schema comment and linted against.
- `Instrument.serialNumber` has both `serialPlain` (owner-internal) and
  `serialMasked` (public, e.g. `2451***21`).
- Every mutating service writes `AuditLog` rows atomically.
- `BlockchainTransaction` rows are upserted by tx hash; the watcher is idempotent.

## 4. Certificate lifecycle

```
IMPORTED ─► PENDING_VALIDATION ─► VALID_SCHEMA ─► PENDING_ISSUER_APPROVAL ─► ISSUED ─► CURRENT
                                                                                     │
                                                     done-superseded ◄── SUPERSEDED ─┘
                                                     time passed      ─► EXPIRED
                                                     admin/issuer     ─► REVOKED (terminal)
```

API surface (v1):

```
POST /api/v1/instruments            GET /api/v1/instruments        GET /api/v1/instruments/:id
GET  /api/v1/instruments/:id/traceability
POST /api/v1/certificates/import    GET /api/v1/certificates       GET /api/v1/certificates/:id
POST /api/v1/certificates/:id/validate
POST /api/v1/certificates/:id/issue
POST /api/v1/certificates/:id/revoke
POST /api/v1/certificates/:id/supersede
GET  /api/v1/calibrations/due
GET  /api/v1/verify/:certificateId        (public)
```

## 5. Traceability graph semantics (ILAC P10-aligned)

Node kinds and edges:

```
INSTRUMENT ──calibrated-by──► CALIBRATION RECORD ──verified-against──► REFERENCE STANDARD
                                              │                          │
                                              owner-of                   operated-by
                                              ▼                          ▼
                                        INSTRUMENT OWNER          REFERENCE LABORATORY
                                                                         │
                                                                         ▼
                                                                ISSUING LABORATORY
```

Each node renders identity, relationship type, certificate/reference id,
relevant dates and current status. Edges are deterministic (ordered by date,
deduplicated by (from,to,kind)). The graph is served by
`GET /instruments/:id/traceability` as `{nodes, edges}` and rendered as SVG in the web app.

## 6. Security posture

- Uploaded XML stored byte-preserved; digests computed over exact bytes.
- No PHI/PIN; personal data limited to contact metadata, DSVGO-friendly (see docs/INTEGRATION_LIMITATIONS.md #8).
- Certificates are append-only; corrections create revisions. No UI path mutates
  a stored issued certificate.
- RBAC: functions under role guards; issuer authorisation checked on-chain at issue
  time (`isIssuerAuthorised`) and mirrored in the DB.
- Registry stores only digests; raw readings and attachments stay off-chain.

## 7. Glossary (VIM3-aligned)

- **Calibration**: operation establishing relation between quantity values with
  uncertainties provided by standards and indications with associated uncertainties.
- **Metrological traceability**: property of a result whereby it relates to a
  reference through an unbroken chain of calibrations, each contributing to the
  measurement uncertainty.
- **Expanded uncertainty U**: quantity defining an interval about the result, from the
  combined standard uncertainty times coverage factor k.

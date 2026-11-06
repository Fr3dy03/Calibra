# CalibraGraph API — REST contract (v1)

Base URL: `/api/v1` · Swagger UI: `http://localhost:4000/api/docs` · Auth: `Authorization: Bearer <jwt>`

Public (no auth): `POST /auth/register`, `POST /auth/login`, `GET /verify/:certificateId`

## Instruments

| Method | Path | Body / Query |
|---|---|---|
| POST | `/instruments` | `{ category, manufacturer, model, serialReference, measurementFunction, rangeFrom, rangeTo, unit, resolution, location?, assetReference? }` |
| GET | `/instruments` | `?q=` `?category=` |
| GET | `/instruments/:id` | accepts uuid or on-chain hex id; serial returned masked |
| GET | `/instruments/:id/traceability` | returns `{ nodes[], edges[] }` traceability graph |

## Certificates

| Method | Path | Body |
|---|---|---|
| POST | `/certificates/validate-schema` | `{ xml }` → `{ schemaVersion, supported, validation{valid, findings[]}, extraction }` (preview, no persistence) |
| POST | `/certificates/import` | `{ xml }` → `{ certificateId, certificateUid, status, digests, duplicate }` |
| GET | `/certificates` | `?status=` `?instrumentId=` |
| GET | `/certificates/:id` | certificate + measurements (exact decimals + units) + uncertainty (U,k,p) + revisions + documents |
| POST | `/certificates/:id/validate` | advances IMPORTED → VALID_SCHEMA |
| POST | `/certificates/:id/issue` | `{ note? }` issuer-only; anchors digest to CalibrationRegistry on BOT Chain |
| POST | `/certificates/:id/revoke` | `{ reason }` issuer/lab-admin only |
| POST | `/certificates/:id/supersede` | defines the supersession instruction; corrections flow through re-import |
| — | revisions | `POST /certificates/:id/supersede` with `{ diff, approvalNote }` limited to mutable metadata (e.g. comments) |

## Calibrations / Due

| Method | Path | Notes |
|---|---|---|
| GET | `/calibrations/due` | buckets: `overdue`, `7`, `30`, `60`, `90`, `none` |
| POST | `/calibrations/due/policy` | `{ lapseDays }` per-organisation reminder policy |
| GET | `/calibrations/due/policies` | active policies |

## Verification (public)

| Method | Path | Notes |
|---|---|---|
| GET | `/verify/:certificateId` | works with uuid, DCC uniqID or on-chain id; includes `blockchain.digestMatch`, `explorerUrl` (BOTScan) |

## Reports

`GET /reports/due-forecast.csv`, `GET /reports/certificate-inventory.csv`, `GET /reports/laboratory-workload.csv`

## Laboratories

`GET /laboratories`, `GET /laboratories/:id` (profile, accreditation evidence with validity, scopes incl. CMC, signer registry, certificate history)

### Error model

```json
{ "code": "CERTIFICATE_DUPLICATE", "message": "certificate DCC-RML-2026-0417 already exists", "digest": "0x…" }
```

Known codes: `CERTIFICATE_DUPLICATE` (409), `CERTIFICATE_CURRENT_EXISTS` (409),
`IMMUTABLE_FIELDS` (400), `DCC_SCHEMA_UNSUPPORTED` (422 preview), `NOT_DCC_ROOT` (422),
`XML_MALFORMED` (422).

### Values policy

- decimals are JSON strings (exact digits, e.g. `"0.000000"`)
- every value field is paired with its SI unit field
- uncertainty always returned with `expandedDecimal`, `unit`, optional `coverageFactor`, `coverageProbability`

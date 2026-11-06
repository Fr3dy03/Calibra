# DCC Implementation — CalibraGraph

How CalibraGraph ingests, validates, stores and version-references PTB
Digital Calibration Certificates (schema `dcc.xsd` v3.3.0).

---

## 1. Ingestion pipeline

```
Upload (.xml)
  └─► [1] Byte-preserving custody      → EvidenceDocument (original bytes, sha3-256 + sha-256 digests)
      └─► [2] Root detection           → namespace + schemaVersion extraction
          └─► [3] XSD validation       → xmllint (libxml2) against bundled dcc.xsd v3.3.0
              ├─ PASS ─► [4] Structured parse (fast-xml-parser, preserveOrder ON)
              ├─ FAIL ─► status=PENDING_VALIDATION, findings returned, parsing aborted
              └─► [4] Field extraction (§2 mapping)
                  └─► [5] Identity checks
                        • duplicate certificate number → reject (409)
                        • digest compare vs. existing certificate number → replay guard
                        • ds:Signature presence → "signed" flag + signer X509 subject (if present)
                        • issuer address NOT inferred from XML (no fabricated credentials)
                  └─► [6] Persistence
                        • Raw XML preserved verbatim
                        • Exact decimals as string (DECIMAL columns, never float)
                        • Units preserved verbatim (si:unit / BIPM notation)
                        • status = IMPORTED (or PENDING_VALIDATION, or VALID_SCHEMA)
```

Rules enforced by the pipeline:

1. **Validate before parse.** A document that does not validate against the declared
   schema version is never offered for certificate creation.
2. **No silent transformation.** Extracted values are stored read-only next to the
   original strings; corrections happen only through the versioned revision flow (§4).
3. **Units and uncertainty are atomic with values.** Every `CalibrationMeasurement`
   row carries `valueDecimal`, `unit`, `uncertaintyValue`, `uncertaintyUnit`,
   `coverageFactor`, `coverageProbability` from the DCC, unmangled.
4. **`refId` / `refType` resolution.** Results are linked to methods/equipment through
   the DCC id/refId graph, so a measurement row knows *which* method produced it.

## 2. Field extraction map (v3.3.0)

| CalibraGraph model | DCC v3.3.0 element |
|---|---|
| `certificateUid` | `administrativeData/coreData/uniqueIdentifier` |
| `issueDate` | `administrativeData/coreData/issueDate` (optional) |
| `validUntil` | `administrativeData/coreData/endPerformanceDate` |
| `beginPerformanceDate` | `administrativeData/coreData/beginPerformanceDate` |
| `performanceLocation` | `administrativeData/coreData/performanceLocation` |
| `documentLang` | `administrativeData/coreData/usedLangCodeISO639_1` / `mandatoryLangCodeISO639_1` |
| Laboratory | `administrativeData/calibrationLaboratory` (`calibrationLaboratoryCode`, `contact`) |
| Responsible persons | `administrativeData/respPersons/respPerson` (name, role, mail) |
| Customer / owner | `administrativeData/customer` |
| Instrument / serial | `administrativeData/items/item` (name, manufacturer, model, `identifications/identification/issuer+value`) |
| Measurement function | `measurementResults/measurementResult/usedMethods/usedMethod` |
| Results table | `measurementResults/measurementResult/results/result` → `data/quantity` |
| Value + unit | `si:real` → `si:value` (exact decimal) + `si:unit` (BIPM notation) |
| Expanded uncertainty | `si:real/measurementUncertaintyUnivariate/expandedMU` → `si:valueExpandedMU`, `si:coverageFactor`, `si:coverageProbability` |
| Conditions | `measurementResults/influenceConditions/influenceCondition` |
| Reference standards | `measurementResults/measuringEquipments` + `usedMethods`, linked via `id`/`refId`/`refType` |
| Comments | root `dcc:comment` (lax content) |
| Attachments | `dcc:document/document/fileName+mimeType+dataBase64` (stored to encrypted object storage) |
| Signatures | `ds:Signature*` — presence, count, KeyInfo/X509Subject when present |

Extraction never invents issuer identity: a `dc:Signature` proves *someone* signed the
XML with some key; CalibraGraph links it to an on-chain authorised issuer only when a
held `CALIBRATION_ISSUER_ROLE` address with an active `IssuerScope` deliberately issues.

## 3. XSD validation implementation

- Validator: **libxml2 via `xmllint`** (required available sidecar in the API container)
  invoked with `--noout --schema <path> --nonet <doc>`. Network access is disabled when
  resolving schema imports; the bundled schema directory contains the DCC imports.
- Schema copies are **pinned per version** (`api/schemas/dcc/v3.3.0/dcc.xsd`).
- Result model: `{ valid, schemaVersion, validator, findings: [{code, path, message, severity}] }`.
- Unsupported `schemaVersion` → fail-closed with finding `DCC_SCHEMA_UNSUPPORTED`.

## 4. Revision / supersession / revocation

- Certificate mutations never edit rows. They create a new `CalibrationCertificate`
  revision (`revision = previous.revision + 1`) with `supersedesId` pointers, and flip
  the previous record to `SUPERSEDED`.
- `REVOKED` is terminal and only reachable by an authorised issuer or lab admin; the
  reason is stored and hashed into the on-chain event.
- Historical versions are immutable: `CertificateRevision` rows store the changed
  metadata *diff only* plus a re-digest; the original bytes never change.

## 5. Digest & anchoring

- `certificateDigest = keccak256(sha256(rawCanonicalXml))` — the raw uploaded XML,
  canonicalised only by excluding non-deterministic serializer artefacts is NOT done:
  we digest the **exact uploaded bytes**, so verification = byte comparison + digest match.
- `measurementScopeHash`, `referenceStandardHash`: keccak256 of the canonical JSON of
  the extracted measurement-result array / reference-standard array (stable JSON,
  sorted keys, decimals as strings).
- The contract stores only digests and indices (see CalibrationRegistry.sol).
- Public verification (`/verify/:certificateId`) recomputes the digest from the stored
  raw XML and compares against the on-chain value; mismatch => red "record mismatch" state.

## 6. Validation test matrix (implemented in `apps/api/test/dcc`)

| Case | File | Expected |
|---|---|---|
| Valid XML | `dcc-valid.xml` | valid, status VALID_SCHEMA, N extracted results |
| Invalid XML (broken structure) | `dcc-invalid-structure.xml` | XSD findings, no parsing |
| Unsupported schema version | `dcc-v9.xml` | `DCC_SCHEMA_UNSUPPORTED`, fail-closed |
| Missing required values | `dcc-missing-value.xml` | findings `REQUIRED_FIELD_*` |
| Incorrect unit | `dcc-bad-unit.xml` | finding `UNIT_UNKNOWN` (si:unit not resolvable), unit preserved verbatim |
| Duplicate certificate | importer test | 409 `CERTIFICATE_DUPLICATE` |
| Signature missing where required by policy | `dcc-unsigned.xml` | finding `SIGNATURE_MISSING`, blocks issue until approved via revision flow |
| Superseded certificate | importer test | duplicates rejected by digest + certificateUid |



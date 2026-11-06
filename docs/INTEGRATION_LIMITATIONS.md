# Integration Limitations & Known Issues

Honest record of what works, what is approximate, and what is out of scope.

## 1. Bohr / BOT Chain

- `eth_getLogs` is **disabled on the quoted mainnet public RPC**
  (https://rpc.botchain.ai). For mainnet log indexing, third-party RPC providers or
  WebSocket subscriptions are required per the official JSON-RPC documentation. The
  confirmation watcher defaults to WebSocket when `RPC_URL` starts with `wss://`.
- Blob transactions (EIP-4844) are supported by the chain and would be the cheaper
  channel for bulk certificate digest bundling — **not implemented in v1**; the
  registry emits discrete events instead.
- Node configuration best practices are documented by BOT but require operating your
  own full node for production-grade indexing; v1 relies on public RPCs and polling.
- Faucet access for testnet BOT comes from the official BOT faucet; CI runs contract
  tests against a local Anvil fork instead of the shared testnet to avoid flakiness.

## 2. DCC schema handling

- Only **schema v3.3.0** is bundled/pinned today. Unknown `schemaVersion` values fail
  closed with `DCC_SCHEMA_UNSUPPORTED` rather than attempting best-effort parsing.
- Vendors disagree on how much content they put inside `richContentType`; duplicates
  across languages mean every extractor must choose a locale. CalibraGraph defaults
  to the document's declared language, otherwise `en`, and stores all variants.
- XSD validation uses libxml2 (`xmllint`). Some on-host DCC generators emit
  schema-valid XML with non-closing whitespace-normalised elements that are
  semantically fine; we do not attempt to "repair" them — we report and stop.
- DCC `ds:Signature` validity (XML-DSig crypto verification) is **not** implemented
  in v1; we detect presence and extract X509 subject metadata for display. Full
  signature checking is scheduled work (see 13. milestones in the spec).

## 3. Verification semantics

- On-chain anchoring proves a laboratory publicly committed a digest at a point in
  time. It does **not** prove the certificate's measurement truth, and never claims to.
- If digests diverge (document re-saved), the UI shows red "record mismatch" and links
  the original anchored transaction for dispute.

## 4. Accreditation data

- Accreditation references are **user-supplied evidence**; CalibraGraph does not contact
  accreditation bodies or ILAC for validation**. Stale/expired evidence is flagged in
  UI but no third-party check is performed.

## 5. Storage

- Local stack uses MinIO; the production path assumes an S3-compatible endpoint with
  SSE-KMS. Envelope-based client-side encryption is intended for restricted
  deployments and is documented but uses server-managed keys in v1.

## 6. Frontend scope

- The traceability graph is deterministic SVG (vertical chain layout). Sub-graph
  traversal (expand arbitrary ancestor standards, branch forking) is conceptual in v1.
- The /app console described here ships with static demo content consistent with the
  domain sample data; full backend wiring is provided through the documented REST
  API contract.

## 7. Contracts

- `CalibrationRegistry.sol` keeps issuance authorisation in-contract, but off-chain
  rescue actions (freeze pause, upgrade path) are **deliberately not implemented**
  to avoid central control of public verification; operator responsibility in v1 is
  final after deployment.
- Gas is denominated in BOT; no gas-optimisation pass was run.

## 8. Data protection

- Contact metadata (names, emails) are processed for notification purposes only.
  The platform is not a medical or safety system; certification data handled here is
  not a substitute for legal metrology obligations.

## 9. E2E testing reality

- Playwright scenarios (register → import → validate → issue → verify → supersede)
  are specified in `apps/web/e2e`; running them requires both API and chain (Anvil)
  running locally via docker-compose, which is not exercised in this build pass.

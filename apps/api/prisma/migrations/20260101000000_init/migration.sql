-- CalibraGraph initial database migration
-- Generated from Prisma schema (apps/api/prisma/schema.prisma)
-- Manual placeholder: `prisma migrate dev` will refine on the live DB.

CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INSTRUMENT_OWNER',
    "organisationId" TEXT,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organisation_members" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgRole" TEXT NOT NULL,
    CONSTRAINT "organisation_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "laboratories" (
    "id" TEXT NOT NULL,
    "registryId" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "profileHash" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "walletAddress" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "accreditation_references" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "standard" TEXT NOT NULL DEFAULT 'ISO/IEC 17025:2017',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "evidenceDigest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "laboratory_scopes" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "rangeFrom" TEXT NOT NULL,
    "rangeTo" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "cmc" TEXT,
    "cmcUnit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "laboratory_signers" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "walletAddress" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "instruments" (
    "id" TEXT NOT NULL,
    "registryId" TEXT,
    "organisationId" TEXT NOT NULL,
    "laboratoryId" TEXT,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serialPlain" TEXT NOT NULL,
    "serialMasked" TEXT NOT NULL,
    "measurementFunction" TEXT NOT NULL,
    "rangeFrom" TEXT NOT NULL,
    "rangeTo" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "location" TEXT,
    "assetReference" TEXT,
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "instrument_specifications" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "filed" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "owner_history" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "previousOwner" TEXT,
    "newOwner" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'platform'
);

CREATE TABLE "calibration_certificates" (
    "id" TEXT NOT NULL,
    "certificateUid" TEXT NOT NULL,
    "registryId" TEXT,
    "instrumentId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "issuerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IMPORTED',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "supersedesId" TEXT,
    "supersededById" TEXT,
    "digest" TEXT,
    "measurementScopeHash" TEXT,
    "referenceStandardHash" TEXT,
    "calibrationDate" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "calibrationMethod" TEXT,
    "conditionsNote" TEXT,
    "comments" TEXT,
    "schemaVersion" TEXT,
    "signaturePresent" BOOLEAN NOT NULL DEFAULT false,
    "revocationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "anchoredAt" TIMESTAMP(3),
    "anchoredTxHash" TEXT
);

CREATE TABLE "calibration_measurements" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "resultIndex" INTEGER NOT NULL,
    "quantityName" TEXT NOT NULL,
    "refMethodRef" TEXT,
    "valueDecimal" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "errorDecimal" TEXT,
    "errorUnit" TEXT,
    "measuredAt" TEXT,
    CONSTRAINT "calibration_measurements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "measurement_uncertainties" (
    "id" TEXT NOT NULL,
    "measurementId" TEXT NOT NULL,
    "expandedDecimal" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "coverageFactor" TEXT,
    "coverageProbability" TEXT,
    "distribution" TEXT,
    CONSTRAINT "measurement_uncertainties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reference_standards" (
    "id" TEXT NOT NULL,
    "standardUid" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "rangeFrom" TEXT,
    "rangeTo" TEXT,
    "unit" TEXT NOT NULL,
    "traceableTo" TEXT,
    "lastCalibrationDate" TIMESTAMP(3),
    "certificateId" TEXT,
    "issuerLaboratory" TEXT,
    "chainDigest" TEXT
);

CREATE TABLE "certificate_revisions" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "changedBy" TEXT,
    "metadataDiff" TEXT,
    "digest" TEXT,
    "approvalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "calibration_events" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "certificateId" TEXT,
    "kind" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT
);

CREATE TABLE "evidence_documents" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "keccak256" TEXT,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "ip" TEXT,
    "verdict" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "notification_policies" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "lapseDays" INTEGER NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "blockchain_transactions" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "eventKind" TEXT NOT NULL,
    "certificateId" TEXT,
    "payload" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

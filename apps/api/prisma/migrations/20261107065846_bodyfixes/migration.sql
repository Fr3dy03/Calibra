/*
  Warnings:

  - You are about to drop the `accreditation_references` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blockchain_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `calibration_certificates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `calibration_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `calibration_measurements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `certificate_revisions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evidence_documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instrument_specifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instruments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `laboratories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `laboratory_scopes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `laboratory_signers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `measurement_uncertainties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification_policies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organisation_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `owner_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reference_standards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LAB_ADMIN', 'CALIBRATION_ISSUER', 'INSTRUMENT_OWNER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('IMPORTED', 'PENDING_VALIDATION', 'VALID_SCHEMA', 'PENDING_ISSUER_APPROVAL', 'ISSUED', 'CURRENT', 'SUPERSEDED', 'REVOKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "accreditation_references";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "blockchain_transactions";

-- DropTable
DROP TABLE "calibration_certificates";

-- DropTable
DROP TABLE "calibration_events";

-- DropTable
DROP TABLE "calibration_measurements";

-- DropTable
DROP TABLE "certificate_revisions";

-- DropTable
DROP TABLE "evidence_documents";

-- DropTable
DROP TABLE "instrument_specifications";

-- DropTable
DROP TABLE "instruments";

-- DropTable
DROP TABLE "laboratories";

-- DropTable
DROP TABLE "laboratory_scopes";

-- DropTable
DROP TABLE "laboratory_signers";

-- DropTable
DROP TABLE "measurement_uncertainties";

-- DropTable
DROP TABLE "notification_policies";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "organisation_members";

-- DropTable
DROP TABLE "owner_history";

-- DropTable
DROP TABLE "reference_standards";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_requests";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INSTRUMENT_OWNER',
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganisationMember" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgRole" TEXT NOT NULL,

    CONSTRAINT "OrganisationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laboratory" (
    "id" TEXT NOT NULL,
    "registryId" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "profileHash" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "walletAddress" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Laboratory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccreditationReference" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "standard" TEXT NOT NULL DEFAULT 'ISO/IEC 17025:2017',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "evidenceDigest" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccreditationReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratoryScope" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "rangeFrom" TEXT NOT NULL,
    "rangeTo" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "cmc" TEXT,
    "cmcUnit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LaboratoryScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaboratorySigner" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "walletAddress" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LaboratorySigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstrumentSpecification" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "filed" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstrumentSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerHistoryEntry" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "previousOwner" TEXT,
    "newOwner" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'platform',

    CONSTRAINT "OwnerHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationCertificate" (
    "id" TEXT NOT NULL,
    "certificateUid" TEXT NOT NULL,
    "registryId" TEXT,
    "instrumentId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "issuerId" TEXT,
    "status" "CertificateStatus" NOT NULL DEFAULT 'IMPORTED',
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
    "anchoredTxHash" TEXT,

    CONSTRAINT "CalibrationCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationMeasurement" (
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

    CONSTRAINT "CalibrationMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeasurementUncertainty" (
    "id" TEXT NOT NULL,
    "measurementId" TEXT NOT NULL,
    "expandedDecimal" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "coverageFactor" TEXT,
    "coverageProbability" TEXT,
    "distribution" TEXT,

    CONSTRAINT "MeasurementUncertainty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceStandard" (
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
    "chainDigest" TEXT,

    CONSTRAINT "ReferenceStandard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateRevision" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "changedBy" TEXT,
    "metadataDiff" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "approvalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CertificateRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationEvent" (
    "id" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "certificateId" TEXT,
    "kind" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" TEXT,

    CONSTRAINT "CalibrationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceDocument" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT,
    "kind" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "keccak256" TEXT,
    "byteSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    "ip" TEXT,
    "verdict" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPolicy" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "lapseDays" INTEGER NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockchainTransaction" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" TEXT NOT NULL,
    "eventKind" TEXT NOT NULL,
    "certificateId" TEXT,
    "payload" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockchainTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrganisationMember_organisationId_userId_key" ON "OrganisationMember"("organisationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_registryId_key" ON "Laboratory"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "Laboratory_walletAddress_key" ON "Laboratory"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "LaboratorySigner_walletAddress_key" ON "LaboratorySigner"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_registryId_key" ON "Instrument"("registryId");

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_serialPlain_key" ON "Instrument"("serialPlain");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationCertificate_certificateUid_key" ON "CalibrationCertificate"("certificateUid");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationCertificate_registryId_key" ON "CalibrationCertificate"("registryId");

-- CreateIndex
CREATE INDEX "CalibrationCertificate_instrumentId_status_idx" ON "CalibrationCertificate"("instrumentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationMeasurement_certificateId_resultIndex_key" ON "CalibrationMeasurement"("certificateId", "resultIndex");

-- CreateIndex
CREATE UNIQUE INDEX "MeasurementUncertainty_measurementId_key" ON "MeasurementUncertainty"("measurementId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceStandard_standardUid_key" ON "ReferenceStandard"("standardUid");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransaction_txHash_key" ON "BlockchainTransaction"("txHash");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganisationMember" ADD CONSTRAINT "OrganisationMember_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccreditationReference" ADD CONSTRAINT "AccreditationReference_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratoryScope" ADD CONSTRAINT "LaboratoryScope_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaboratorySigner" ADD CONSTRAINT "LaboratorySigner_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Instrument" ADD CONSTRAINT "Instrument_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstrumentSpecification" ADD CONSTRAINT "InstrumentSpecification_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnerHistoryEntry" ADD CONSTRAINT "OwnerHistoryEntry_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationCertificate" ADD CONSTRAINT "CalibrationCertificate_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationCertificate" ADD CONSTRAINT "CalibrationCertificate_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "Laboratory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationCertificate" ADD CONSTRAINT "CalibrationCertificate_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationCertificate" ADD CONSTRAINT "CalibrationCertificate_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "CalibrationCertificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationMeasurement" ADD CONSTRAINT "CalibrationMeasurement_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "CalibrationCertificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeasurementUncertainty" ADD CONSTRAINT "MeasurementUncertainty_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "CalibrationMeasurement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceStandard" ADD CONSTRAINT "ReferenceStandard_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "CalibrationCertificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificateRevision" ADD CONSTRAINT "CertificateRevision_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "CalibrationCertificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationEvent" ADD CONSTRAINT "CalibrationEvent_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationEvent" ADD CONSTRAINT "CalibrationEvent_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "CalibrationCertificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceDocument" ADD CONSTRAINT "EvidenceDocument_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "CalibrationCertificate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPolicy" ADD CONSTRAINT "NotificationPolicy_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

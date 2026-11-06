// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CalibrationRegistry
 * @notice On-chain registry of calibration certificate digests for the
 *         CalibraGraph platform, anchored on BOT Chain.
 *
 * Stores ONLY digests and identifiers. Raw calibration readings, measurement
 * documents and confidential certificate XML never touch the chain.
 *
 * Roles:
 *  - DEFAULT_ADMIN_ROLE: registry administration (grants other roles).
 *  - LAB_ADMIN_ROLE:     laboratory administrator; manages laboratories and
 *                        delegates issuance to issuer addresses within a scope.
 *  - CALIBRATION_ISSUER_ROLE: an address allowed to issue certificates within
 *                        an active IssuerScope.
 *  - INSTRUMENT_OWNER_ROLE: an address allowed to register instruments it owns.
 */
contract CalibrationRegistry is AccessControl {
    bytes32 public constant LAB_ADMIN_ROLE = keccak256("LAB_ADMIN_ROLE");
    bytes32 public constant CALIBRATION_ISSUER_ROLE = keccak256("CALIBRATION_ISSUER_ROLE");
    bytes32 public constant INSTRUMENT_OWNER_ROLE = keccak256("INSTRUMENT_OWNER_ROLE");

    // ------------------------------------------------------------------ types

    enum CertificateStatus {
        None,        // 0 unset
        Imported,    // 1 db-only stage, never anchored
        Issued,      // 2 anchored and authoritative
        Superseded,  // 3 replaced by a newer revision
        Revoked,     // 4 terminal, invalid
        Expired      // 5 past validUntil (derived time state)
    }

    struct Instrument {
        bytes32 instrumentId;
        address owner;             // instrument owner account
        bytes32 instrumentType;    // keccak256 of category + measurement function
        bytes32 specificationHash; // range/unit/resolution spec digest
        uint64 createdAt;
        bool active;
    }

    struct Laboratory {
        bytes32 laboratoryId;
        address administrator;     // LAB_ADMIN_ROLE holder controlling this lab
        bytes32 profileHash;       // off-chain laboratory profile digest
        bool approved;             // approved by registry admin to issue
    }

    struct IssuerScope {
        address issuer;            // CALIBRATION_ISSUER_ROLE holder
        bytes32 scopeHash;         // laboratory + measurement scope digest
        bool active;
    }

    struct CalibrationCertificate {
        bytes32 certificateId;
        bytes32 instrumentId;
        address issuer;
        bytes32 certificateDigest;        // keccak256(sha256(raw canonical xml bytes))
        bytes32 measurementScopeHash;     // digest of measurement result array
        bytes32 referenceStandardHash;    // digest of reference standard array
        uint64 issueDate;
        uint64 validUntil;
        uint32 revision;
        bytes32 supersedesId;             // zero when original
        CertificateStatus status;
    }

    // ------------------------------------------------------------------ state

    mapping(bytes32 => Instrument) public instruments;
    mapping(bytes32 => Laboratory) public laboratories;
    /// @notice laboratory administrator => laboratoryId (v1: one lab per admin)
    mapping(address => bytes32) public laboratoryOfAdmin;
    /// @notice issuer => active IssuerScope
    mapping(address => IssuerScope) public issuerScopes;
    /// @notice certificateId => certificate
    mapping(bytes32 => CalibrationCertificate) public certificates;
    /// @notice replay protection: certificateDigest => already anchored
    mapping(bytes32 => bool) public anchoredDigests;
    /// @notice instrumentId => current (most recent, not yet superseded) certificateId
    mapping(bytes32 => bytes32) public currentCertificate;

    // ------------------------------------------------------------------ events

    event LaboratoryRegistered(bytes32 indexed laboratoryId, address indexed administrator, bytes32 profileHash);
    event IssuerScopeUpdated(address indexed issuer, bytes32 indexed scopeHash, bool active);
    event InstrumentRegistered(bytes32 indexed instrumentId, address indexed owner, bytes32 instrumentType);
    event InstrumentOwnershipChanged(bytes32 indexed instrumentId, address indexed previousOwner, address indexed newOwner);
    event CalibrationIssued(bytes32 indexed certificateId, bytes32 indexed instrumentId, address indexed issuer, bytes32 certificateDigest, uint64 validUntil, uint32 revision);
    event CalibrationSuperseded(bytes32 indexed previousCertificateId, bytes32 indexed newCertificateId, uint32 newRevision);
    event CalibrationRevoked(bytes32 indexed certificateId, address indexed revoker, string reason);

    // ------------------------------------------------------------------ errors

    error NotApprovedLaboratory();
    error NotAuthorizedIssuer();
    error IssuerScopeInactive();
    error InstrumentUnknownOrInactive();
    error NotInstrumentOwner();
    error CertificateUnknown();
    error CertificateNotCurrent();
    error DuplicateDigest(bytes32 certificateDigest);
    error InvalidValidityWindow();
    error KeyConflict(bytes32 id, bytes32 expectedCurrent, bytes32 providedPrev);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ------------------------------------------------------------- laboratories

    function registerLaboratory(
        bytes32 laboratoryId,
        bytes32 profileHash
    ) external onlyRole(LAB_ADMIN_ROLE) returns (bool) {
        Laboratory storage lab = laboratories[laboratoryId];
        lab.laboratoryId = laboratoryId;
        lab.administrator = msg.sender;
        lab.profileHash = profileHash;
        // Registry admin approval is a separate act (see approveLaboratory).
        laboratoryOfAdmin[msg.sender] = laboratoryId;
        emit LaboratoryRegistered(laboratoryId, msg.sender, profileHash);
        return true;
    }

    function approveLaboratory(bytes32 laboratoryId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Laboratory storage lab = laboratories[laboratoryId];
        if (lab.administrator == address(0)) revert NotApprovedLaboratory();
        lab.approved = true;
    }

    function setIssuerScope(address issuer, bytes32 scopeHash, bool active)
        external
        onlyRole(LAB_ADMIN_ROLE)
    {
        Laboratory memory labOfAdmin = laboratories[laboratoryOfAdmin[msg.sender]];
        if (!labOfAdmin.approved) revert NotApprovedLaboratory();
        issuerScopes[issuer] = IssuerScope({issuer: issuer, scopeHash: scopeHash, active: active});
        if (active) {
            _grantRole(CALIBRATION_ISSUER_ROLE, issuer);
        } else {
            _revokeRole(CALIBRATION_ISSUER_ROLE, issuer);
        }
        emit IssuerScopeUpdated(issuer, scopeHash, active);
    }

    function revokeIssuer(address issuer) external onlyRole(LAB_ADMIN_ROLE) {
        Laboratory memory labOfAdmin = laboratories[laboratoryOfAdmin[msg.sender]];
        if (!labOfAdmin.approved) revert NotApprovedLaboratory();
        issuerScopes[issuer] = IssuerScope({issuer: issuer, scopeHash: issuerScopes[issuer].scopeHash, active: false});
        _revokeRole(CALIBRATION_ISSUER_ROLE, issuer);
        emit IssuerScopeUpdated(issuer, issuerScopes[issuer].scopeHash, false);
    }

    function isIssuerAuthorised(address issuer) external view returns (bool) {
        return hasRole(CALIBRATION_ISSUER_ROLE, issuer) && issuerScopes[issuer].active;
    }

    function _laboratoryOf(address administrator) internal view returns (Laboratory memory) {
        Laboratory memory lab;
        return lab; // resolved off-chain; placeholder kept for interface stability
    }

    // -------------------------------------------------------------- instruments

    function registerInstrument(
        bytes32 instrumentId,
        bytes32 instrumentType,
        bytes32 specificationHash
    ) external onlyRole(INSTRUMENT_OWNER_ROLE) returns (bool) {
        Instrument storage inst = instruments[instrumentId];
        inst.instrumentId = instrumentId;
        inst.owner = msg.sender;
        inst.instrumentType = instrumentType;
        inst.specificationHash = specificationHash;
        inst.createdAt = uint64(block.timestamp);
        inst.active = true;
        emit InstrumentRegistered(instrumentId, msg.sender, instrumentType);
        return true;
    }

    function transferInstrumentOwnership(bytes32 instrumentId, address newOwner)
        external
        returns (bool)
    {
        Instrument storage inst = instruments[instrumentId];
        if (!inst.active) revert InstrumentUnknownOrInactive();
        if (msg.sender != inst.owner) revert NotInstrumentOwner();
        address previous = inst.owner;
        inst.owner = newOwner;
        _grantRole(INSTRUMENT_OWNER_ROLE, newOwner);
        emit InstrumentOwnershipChanged(instrumentId, previous, newOwner);
        return true;
    }

    function getInstrument(bytes32 instrumentId) external view returns (Instrument memory) {
        return instruments[instrumentId];
    }

    // --------------------------------------------------------------- certificate

    function issueCalibration(
        bytes32 certificateId,
        bytes32 instrumentId,
        bytes32 certificateDigest,
        bytes32 measurementScopeHash,
        bytes32 referenceStandardHash,
        uint64 issueDate,
        uint64 validUntil,
        uint32 revision,
        bytes32 supersedesId
    ) external returns (bool) {
        if (!issuerScopes[msg.sender].active) revert IssuerScopeInactive();

        Instrument memory inst = instruments[instrumentId];
        if (!inst.active) revert InstrumentUnknownOrInactive();

        if (validUntil <= issueDate || validUntil < block.timestamp) revert InvalidValidityWindow();

        if (anchoredDigests[certificateDigest]) revert DuplicateDigest(certificateDigest);

        // The previous certificate must actually be the current one (replay / fork guard).
        bytes32 currentId = currentCertificate[instrumentId];
        bool isOriginal = (revision == 1 && supersedesId == bytes32(0));
        if (!isOriginal && currentId != supersedesId) revert KeyConflict(instrumentId, currentId, supersedesId);

        CalibrationCertificate memory cert;
        cert.certificateId = certificateId;
        cert.instrumentId = instrumentId;
        cert.issuer = msg.sender;
        cert.certificateDigest = certificateDigest;
        cert.measurementScopeHash = measurementScopeHash;
        cert.referenceStandardHash = referenceStandardHash;
        cert.issueDate = issueDate;
        cert.validUntil = validUntil;
        cert.revision = revision;
        cert.supersedesId = supersedesId;
        cert.status = CertificateStatus.Issued;

        certificates[certificateId] = cert;
        anchoredDigests[certificateDigest] = true;
        currentCertificate[instrumentId] = certificateId;

        if (supersedesId != bytes32(0)) {
            certificates[supersedesId].status = CertificateStatus.Superseded;
            emit CalibrationSuperseded(supersedesId, certificateId, revision);
        }

        emit CalibrationIssued(certificateId, instrumentId, msg.sender, certificateDigest, validUntil, revision);
        return true;
    }

    function revokeCalibration(bytes32 certificateId, string calldata reason) external returns (bool) {
        CalibrationCertificate storage cert = certificates[certificateId];
        if (cert.certificateId != certificateId) revert CertificateUnknown();
        if (cert.status != CertificateStatus.Issued) revert CertificateNotCurrent();

        bool issuerOfThis = (msg.sender == cert.issuer && issuerScopes[msg.sender].active);
        bool labAdmin = hasRole(LAB_ADMIN_ROLE, msg.sender);
        bool registryAdmin = hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        if (!(issuerOfThis || labAdmin || registryAdmin)) revert NotAuthorizedIssuer();

        cert.status = CertificateStatus.Revoked;
        emit CalibrationRevoked(certificateId, msg.sender, reason);
        return true;
    }

    function supersedeCalibration(
        bytes32 previousCertificateId,
        bytes32 newCertificateId,
        bytes32 instrumentId,
        bytes32 certificateDigest,
        bytes32 measurementScopeHash,
        bytes32 referenceStandardHash,
        uint64 issueDate,
        uint64 validUntil
    ) external returns (bool) {
        CalibrationCertificate memory prev = certificates[previousCertificateId];
        if (prev.status != CertificateStatus.Issued) revert CertificateNotCurrent();
        if (currentCertificate[instrumentId] != previousCertificateId) revert CertificateNotCurrent();

        return issueCalibration({
            certificateId: newCertificateId,
            instrumentId: instrumentId,
            certificateDigest: certificateDigest,
            measurementScopeHash: measurementScopeHash,
            referenceStandardHash: referenceStandardHash,
            issueDate: issueDate,
            validUntil: validUntil,
            revision: prev.revision + 1,
            supersedesId: previousCertificateId
        });
    }

    function getCertificate(bytes32 certificateId) external view returns (CalibrationCertificate memory) {
        return certificates[certificateId];
    }

    function getCertificateStatus(bytes32 certificateId) external view returns (CertificateStatus) {
        CalibrationCertificate memory cert = certificates[certificateId];
        if (cert.status == CertificateStatus.Issued && block.timestamp > cert.validUntil) {
            return CertificateStatus.Expired;
        }
        return cert.status;
    }

    function isCalibrationCurrent(bytes32 certificateId) external view returns (bool) {
        CalibrationCertificate memory cert = certificates[certificateId];
        return certificates[currentCertificate[cert.instrumentId]].certificateId == certificateId &&
            block.timestamp <= cert.validUntil &&
            cert.status == CertificateStatus.Issued;
    }
}

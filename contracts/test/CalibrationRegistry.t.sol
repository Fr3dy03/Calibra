// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CalibrationRegistry.sol";

/**
 * @title CalibrationRegistryTests
 * @notice Covers the spec-required contract test matrix:
 *   laboratory roles, issuer scope, certificate issuance, expiration,
 *   revocation, supersession and replay protection.
 */
contract CalibrationRegistryTests is Test {
    CalibrationRegistry registry;

    address admin = makeAddr("registry-admin");
    address labAdmin = makeAddr("lab-admin");
    address issuer = makeAddr("issuer");
    address owner = makeAddr("instrument-owner");
    address attacker = makeAddr("attacker");

    bytes32 LAB_ADMIN;
    bytes32 ISSUER;
    bytes32 INSTRUMENT_OWNER;

    bytes32 labId = keccak256("lab-rml-2001");
    bytes32 profileHash = keccak256("rml-profile-v1");
    bytes32 scopeHash = keccak256("rml-scope-dc-voltage");
    bytes32 instrumentId = keccak256("instrument-dmm-8846a");
    bytes32 instrumentType = keccak256("digital-multimeter");
    bytes32 specHash = keccak256("dmm-spec-1000v");
    bytes32 certA = keccak256("cert-dcc-rml-2026-0417");
    bytes32 certB = keccak256("cert-dcc-rml-2026-0417-rev2");

    bytes32 digestA = keccak256("sha256-of-raw-xml-A");
    bytes32 digestB = keccak256("sha256-of-raw-xml-B");
    bytes32 measHash = keccak256("measurements-11v-dc");
    bytes32 refHash = keccak256("ref-standard-rm-0151");

    uint64 issueDate;
    uint64 validUntil;

    function setUp() public {
        registry = new CalibrationRegistry();
        admin = msg.sender; // deployer received DEFAULT_ADMIN_ROLE in ctor
        LAB_ADMIN = registry.LAB_ADMIN_ROLE();
        ISSUER = registry.CALIBRATION_ISSUER_ROLE();
        INSTRUMENT_OWNER = registry.INSTRUMENT_OWNER_ROLE();

        issueDate = uint64(block.timestamp);
        validUntil = uint64(block.timestamp + 365 days);

        vm.prank(admin);
        registry.grantRole(LAB_ADMIN, labAdmin);
        vm.prank(admin);
        registry.grantRole(INSTRUMENT_OWNER, owner);
        vm.startPrank(labAdmin);
        registry.registerLaboratory(labId, profileHash);
        vm.stopPrank();
        vm.prank(admin);
        registry.approveLaboratory(labId);
        vm.prank(labAdmin);
        registry.setIssuerScope(issuer, scopeHash, true);
        vm.prank(owner);
        registry.registerInstrument(instrumentId, instrumentType, specHash);
    }

    // ---------------- laboratory ----------------

    function test_LaboratoryRoleGrantsRegistration() public {
        vm.prank(labAdmin);
        assertTrue(registry.registerLaboratory(keccak256("lab-2"), profileHash));
    }

    function test_LaboratoryApprovalGatesIssuerScopes() public {
        address lab2Admin = makeAddr("lab2-admin");
        vm.prank(admin);
        registry.grantRole(LAB_ADMIN, lab2Admin);
        vm.prank(lab2Admin);
        registry.registerLaboratory(keccak256("lab-2"), profileHash);
        vm.expectRevert(CalibrationRegistry.NotApprovedLaboratory.selector);
        vm.prank(lab2Admin);
        registry.setIssuerScope(makeAddr("issuer2"), scopeHash, true);
    }

    function test_UnapprovedIssuerCannotIssue() public {
        vm.expectRevert(CalibrationRegistry.IssuerScopeInactive.selector);
        vm.prank(attacker);
        registry.issueCalibration(certA, instrumentId, digestA, measHash, refHash, issueDate, validUntil, 1, bytes32(0));
    }

    // ---------------- issuance ----------------

    function test_IssuanceByAuthorisedIssuer() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        (, bytes32 instId, address issuedBy, bytes32 dig,) = _cert(certA);
        assertEq(instId, instrumentId);
        assertEq(issuedBy, issuer);
        assertEq(dig, digestA);
        assertTrue(_current(certA));
    }

    function test_IssuanceByNonOwnerInstrumentFails() public {
        bytes32 unknownInstrument = keccak256("ghost-instrument");
        vm.expectRevert(CalibrationRegistry.InstrumentUnknownOrInactive.selector);
        vm.prank(issuer);
        registry.issueCalibration(certA, unknownInstrument, digestA, measHash, refHash, issueDate, validUntil, 1, bytes32(0));
    }

    function test_InvalidValidityWindowRejected() public {
        vm.expectRevert(CalibrationRegistry.InvalidValidityWindow.selector);
        vm.prank(issuer);
        registry.issueCalibration(certA, instrumentId, digestA, measHash, refHash, issueDate, issueDate - 1, 1, bytes32(0));
    }

    // ---------------- expiration ----------------

    function test_CertificateExpiresAfterValidUntil() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.warp(validUntil + 1);
        assertEq(uint256(registry.getCertificateStatus(certA)), uint256(CalibrationRegistry.CertificateStatus.Expired));
        assertFalse(registry.isCalibrationCurrent(certA));
    }

    // ---------------- revocation ----------------

    function test_IssuerCanRevokeOwnCertificate() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.prank(issuer);
        assertTrue(registry.revokeCalibration(certA, "issuer error"));
        assertEq(uint256(registry.getCertificateStatus(certA)), uint256(CalibrationRegistry.CertificateStatus.Revoked));
        assertFalse(registry.isCalibrationCurrent(certA));
    }

    function test_RandomAccountCannotRevoke() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.expectRevert(CalibrationRegistry.NotAuthorizedIssuer.selector);
        vm.prank(attacker);
        registry.revokeCalibration(certA, "unauthorised");
    }

    function test_RevokedCertificateCannotBeRevokedAgain() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.prank(issuer);
        registry.revokeCalibration(certA, "issuer error");
        vm.expectRevert(CalibrationRegistry.CertificateNotCurrent.selector);
        vm.prank(issuer);
        registry.revokeCalibration(certA, "again");
    }

    // ---------------- supersession ----------------

    function test_SupersessionIncrementsRevisionAndSupersedesPrevious() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.prank(issuer);
        assertTrue(registry.supersedeCalibration(certA, certB, instrumentId, digestB, measHash, refHash, issueDate, validUntil));
        (, , , , uint32 revision) = _cert(certB);
        assertEq(revision, 2);
        assertEq(uint256(registry.getCertificateStatus(certA)), uint256(CalibrationRegistry.CertificateStatus.Superseded));
        assertTrue(registry.isCalibrationCurrent(certB));
        assertFalse(registry.isCalibrationCurrent(certA));
    }

    function test_SupersedingWithStalePreviousFails() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.prank(issuer);
        registry.supersedeCalibration(certA, certB, instrumentId, digestB, measHash, refHash, issueDate, validUntil);
        // certA is now superseded; another chain attempt must fail
        vm.expectRevert(CalibrationRegistry.CertificateNotCurrent.selector);
        vm.prank(issuer);
        registry.supersedeCalibration(certA, keccak256("cert-c"), instrumentId, keccak256("digest-c"), measHash, refHash, issueDate, validUntil);
    }

    function test_SupersededCertificateIsStillHistorical() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.prank(issuer);
        registry.supersedeCalibration(certA, certB, instrumentId, digestB, measHash, refHash, issueDate, validUntil);
        CalibrationRegistry.CalibrationCertificate memory old = registry.getCertificate(certA);
        // historical record remains fully intact on-chain
        assertEq(old.certificateDigest, digestA);
        assertEq(old.issuer, issuer);
        assertEq(old.status, CalibrationRegistry.CertificateStatus.Superseded);
    }

    // ---------------- replay / duplicate protection ----------------

    function test_DuplicateDigestRejected() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.expectRevert(abi.encodeWithSelector(CalibrationRegistry.DuplicateDigest.selector, digestA));
        vm.prank(issuer);
        registry.issueCalibration(certB, instrumentId, digestA, measHash, refHash, issueDate, validUntil, 1, bytes32(0));
    }

    function test_OriginalIssuedTwiceFailsKeyConflict() public {
        assertTrue(_issue(certA, digestA, 1, bytes32(0)));
        vm.expectRevert(CalibrationRegistry.KeyConflict.selector);
        vm.prank(issuer);
        registry.issueCalibration(certB, instrumentId, digestB, measHash, refHash, issueDate, validUntil, 1, bytes32(0));
    }

    // ---------------- ownership ----------------

    function test_OnlyOwnerCanTransferInstrument() public {
        vm.expectRevert(CalibrationRegistry.NotInstrumentOwner.selector);
        vm.prank(attacker);
        registry.transferInstrumentOwnership(instrumentId, attacker);
        vm.prank(owner);
        assertTrue(registry.transferInstrumentOwnership(instrumentId, attacker));
        assertEq(registry.getInstrument(instrumentId).owner, attacker);
    }

    // ---------------- issuer lifecycle ----------------

    function test_RevokeIssuerScalesDownScope() public {
        vm.prank(labAdmin);
        registry.revokeIssuer(issuer);
        assertFalse(registry.isIssuerAuthorised(issuer));
        vm.expectRevert(CalibrationRegistry.IssuerScopeInactive.selector);
        vm.prank(issuer);
        registry.issueCalibration(certA, instrumentId, digestA, measHash, refHash, issueDate, validUntil, 1, bytes32(0));
    }

    // ---------------- helpers ----------------

    function _issue(bytes32 id, bytes32 dig, uint32 rev, bytes32 supersedes) internal returns (bool) {
        vm.prank(issuer);
        return registry.issueCalibration(id, instrumentId, dig, measHash, refHash, issueDate, validUntil, rev, supersedes);
    }

    function _cert(bytes32 id)
        internal
        view
        returns (bytes32 cid, bytes32 instId, address issuedBy, bytes32 dig, uint32 revision)
    {
        CalibrationRegistry.CalibrationCertificate memory c = registry.getCertificate(id);
        cid = c.certificateId;
        instId = c.instrumentId;
        issuedBy = c.issuer;
        dig = c.certificateDigest;
        revision = c.revision;
    }

    function _current(bytes32 id) internal view returns (bool) {
        return registry.isCalibrationCurrent(id);
    }
}

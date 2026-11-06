// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CalibrationRegistry.sol";

/**
 * @notice Deployment script for CalibraGraph's CalibrationRegistry on BOT Chain.
 *
 * Testnet targets (https://dev-docs.botchain.ai/docs/Developers/quick-guide/):
 *   chain 968, rpc https://rpc.bohr.life, explorer https://scan.bohr.life/
 * Mainnet targets:
 *   chain 677, rpc https://rpc.botchain.ai, explorer https://scan.botchain.ai/
 *
 * Usage (testnet):
 *   forge script script/Deploy.s.sol \
 *     --rpc-url https://rpc.bohr.life \
 *     --broadcast --verify -vvvv
 * The DEPLOYER_PRIVATE_KEY is read from the environment; never commit it.
 */
contract Deploy is Script {
    function run() external returns (CalibrationRegistry registry) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        registry = new CalibrationRegistry();

        // Optional post-deployment bootstrap (both read from env if present):
        // grants LAB_ADMIN_ROLE / INSTRUMENT_OWNER_ROLE to configured addresses.
        try vm.envAddress("LAB_ADMIN_ADDRESS") returns (address labAdmin) {
            if (labAdmin != address(0)) {
                registry.grantRole(registry.LAB_ADMIN_ROLE(), labAdmin);
            }
        } catch {}

        try vm.envAddress("INSTRUMENT_OWNER_ADDRESS") returns (address owner) {
            if (owner != address(0)) {
                registry.grantRole(registry.INSTRUMENT_OWNER_ROLE(), owner);
            }
        } catch {}

        console2.log("CalibrationRegistry deployed at:", address(registry));
        console2.log("Chain:", block.chainid);
        vm.stopBroadcast();

        // Persist the deployment artifact for the backend (.env wiring).
        string memory chainId = vm.toString(block.chainid);
        string memory json = string.concat(
            '{"chainId":', chainId,
            ',"registry":"',
            vm.toString(address(registry)),
            '"}'
        );
        vm.writeFile("deployments/latest.json", json);
    }
}

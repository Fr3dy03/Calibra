/**
 * CalibrationRegistry client (viem) for BOT Chain.
 * Networks per https://dev-docs.botchain.ai/docs/Developers/quick-guide/
 *   mainnet: chainId 677, https://rpc.botchain.ai
 *   testnet: chainId 968, https://rpc.bohr.life
 * Only digests and identifiers are submitted; no raw measurements.
 */
import { Injectable, Logger } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, webSocket, toHex, keccak256, defineChain, type Hex, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const ABI = [
  /* minimal ABI both directions: mirrored from contracts/out/CalibrationRegistry.sol/CalibrationRegistry.json */
  { inputs: [{ name: 'certificateId', type: 'bytes32' }, { name: 'instrumentId', type: 'bytes32' }, { name: 'certificateDigest', type: 'bytes32' }, { name: 'measurementScopeHash', type: 'bytes32' }, { name: 'referenceStandardHash', type: 'bytes32' }, { name: 'issueDate', type: 'uint64' }, { name: 'validUntil', type: 'uint64' }, { name: 'revision', type: 'uint32' }, { name: 'supersedesId', type: 'bytes32' }], name: 'issueCalibration', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'certificateId', type: 'bytes32' }, { name: 'reason', type: 'string' }], name: 'revokeCalibration', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'previousCertificateId', type: 'bytes32' }, { name: 'newCertificateId', type: 'bytes32' }, { name: 'instrumentId', type: 'bytes32' }, { name: 'certificateDigest', type: 'bytes32' }, { name: 'measurementScopeHash', type: 'bytes32' }, { name: 'referenceStandardHash', type: 'bytes32' }, { name: 'issueDate', type: 'uint64' }, { name: 'validUntil', type: 'uint64' }], name: 'supersedeCalibration', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'instrumentId', type: 'bytes32' }, { name: 'instrumentType', type: 'bytes32' }, { name: 'specificationHash', type: 'bytes32' }], name: 'registerInstrument', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: 'instrumentId', type: 'bytes32' }, { name: 'newOwner', type: 'address' }], name: 'transferInstrumentOwnership', outputs: [{ type: 'bool' }], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ name: '', type: 'bytes32' }], name: 'certificates', outputs: [{ name: 'certificateId', type: 'bytes32' }, { name: 'instrumentId', type: 'bytes32' }, { name: 'issuer', type: 'address' }, { name: 'certificateDigest', type: 'bytes32' }, { name: 'measurementScopeHash', type: 'bytes32' }, { name: 'referenceStandardHash', type: 'bytes32' }, { name: 'issueDate', type: 'uint64' }, { name: 'validUntil', type: 'uint64' }, { name: 'revision', type: 'uint32' }, { name: 'supersedesId', type: 'bytes32' }, { name: 'status', type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '', type: 'bytes32' }], name: 'getCertificateStatus', outputs: [{ type: 'uint8' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '', type: 'bytes32' }], name: 'anchoredDigests', outputs: [{ type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: '', type: 'address' }], name: 'isIssuerAuthorised', outputs: [{ type: 'bool' }], stateMutability: 'view', type: 'function' },
  { anonymous: false, inputs: [{ indexed: true, name: 'certificateId', type: 'bytes32' }, { indexed: true, name: 'instrumentId', type: 'bytes32' }, { indexed: true, name: 'issuer', type: 'address' }, { indexed: false, name: 'certificateDigest', type: 'bytes32' }, { indexed: false, name: 'validUntil', type: 'uint64' }, { indexed: false, name: 'revision', type: 'uint32' }], name: 'CalibrationIssued', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, name: 'previousCertificateId', type: 'bytes32' }, { indexed: true, name: 'newCertificateId', type: 'bytes32' }, { indexed: false, name: 'newRevision', type: 'uint32' }], name: 'CalibrationSuperseded', type: 'event' },
  { anonymous: false, inputs: [{ indexed: true, name: 'certificateId', type: 'bytes32' }, { indexed: true, name: 'revoker', type: 'address' }, { indexed: false, name: 'reason', type: 'string' }], name: 'CalibrationRevoked', type: 'event' },
] as const;

export const BOT_CHAINS = {
  botTestnet: defineChain({
    id: 968,
    name: 'BOT Chain Testnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: { default: { http: [process.env.BOT_TESTNET_RPC_URL ?? 'https://rpc.bohr.life'] } },
    blockExplorers: { default: { name: 'BOTScan', url: 'https://scan.bohr.life/' } },
    testnet: true,
  }),
  botMainnet: defineChain({
    id: 677,
    name: 'BOT Chain Mainnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: { default: { http: [process.env.BOT_MAINNET_RPC_URL ?? 'https://rpc.botchain.ai'] } },
    blockExplorers: { default: { name: 'BOTScan', url: 'https://scan.botchain.ai/' } },
  }),
} as const;

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);
  private wallet: WalletClient | undefined;
  publicClient() {
    const chain = Number(process.env.CHAIN_ID ?? 968) === 677 ? BOT_CHAINS.botMainnet : BOT_CHAINS.botTestnet;
    const transport = String(chain.rpcUrls.default.http[0]).startsWith('wss')
      ? webSocket(chain.rpcUrls.default.http[0])
      : http(chain.rpcUrls.default.http[0]);
    return createPublicClient({ chain, transport });
  }

  constructor() {
    const key = process.env.REGISTRY_DEPLOYER_KEY;
    const chain = Number(process.env.CHAIN_ID ?? 968) === 677 ? BOT_CHAINS.botMainnet : BOT_CHAINS.botTestnet;
    if (key) {
      const account = privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hex);
      this.wallet = createWalletClient({ chain, transport: http(chain.rpcUrls.default.http[0]), account });
      this.logger.log(`registry wallet ${account.address} configured (writes will anchor digests on-chain)`);
    } else {
      this.logger.warn('REGISTRY_DEPLOYER_KEY unset — registry calls will be simulated (test/demo safety)');
    }
  }

  private address() { return this.wallet?.account?.address; }
  private registryAddress() { return process.env.REGISTRY_ADDRESS as Hex; }

  /** Writes are no-op'd when no wallet is configured (development without keys). */
  private async write(fn: { address?: Hex; abi?: unknown; functionName: string; args: readonly unknown[] }, fallback: () => Promise<{ txHash: string }>) {
    if (!this.wallet || !this.registryAddress()) return fallback();
    const chain = Number(process.env.CHAIN_ID ?? 968) === 677 ? BOT_CHAINS.botMainnet : BOT_CHAINS.botTestnet;
    const hash = await this.wallet.writeContract({
      account: this.wallet.account!,
      address: fn.address ?? this.registryAddress(),
      chain,
      abi: ABI,
      functionName: fn.functionName as never,
      args: fn.args as never,
    });
    const receipt = await this.publicClient().waitForTransactionReceipt({ hash });
    this.logger.log(`registry tx ${hash} confirmed at block ${receipt.blockNumber}`);
    return { txHash: hash, blockNumber: receipt.blockNumber };
  }

  getCertificate(certificateId: string): Promise<string | null> {
    return this.publicClient().readContract({ address: this.registryAddress(), abi: ABI, functionName: 'getCertificateStatus', args: [toHexStr(certificateId)] })
      .then(() => this.publicClient().readContract({ address: this.registryAddress(), abi: ABI, functionName: 'certificates', args: [toHexStr(certificateId)] }))
      .then((c) => (c as unknown as unknown[])[3] as string)
      .catch(() => null);
  }

  async issueCalibration(input: {
    certificateId: string; instrumentId: string; certificateDigest: string;
    measurementScopeHash: string; referenceStandardHash: string;
    issueDate: Date; validUntil: Date; revision: number; supersedesId?: string;
  }) {
    return this.write(
      { address: this.registryAddress(), abi: ABI, functionName: 'issueCalibration', args: [
        toHexStr(input.certificateId), toHexStr(input.instrumentId), toHexStr(input.certificateDigest),
        toHexStr(input.measurementScopeHash), toHexStr(input.referenceStandardHash),
        BigInt(Math.floor(input.issueDate.getTime() / 1000)), BigInt(Math.floor(input.validUntil.getTime() / 1000)),
        input.revision, toHexStr(input.supersedesId ?? ''),
      ] },
      async () => ({ txHash: `simulated-${Date.now()}`, blockNumber: 0n }),
    );
  }

  async revokeCalibration(certificateId: string, reason: string) {
    return this.write(
      { address: this.registryAddress(), abi: ABI, functionName: 'revokeCalibration', args: [toHexStr(certificateId), reason] },
      async () => ({ txHash: `simulated-${Date.now()}`, blockNumber: 0n }),
    );
  }

  async supersedeCalibration(input: Record<string, unknown>) {
    return this.write(
      { address: this.registryAddress(), abi: ABI, functionName: 'supersedeCalibration', args: Object.values(input).map((v) => (typeof v === 'number' ? BigInt(v) : v)) as never },
      async () => ({ txHash: `simulated-${Date.now()}`, blockNumber: 0n }),
    );
  }

  async registerInstrument(instrumentId: Hex, instrumentType: Hex, specHash: Hex) {
    return this.write(
      { address: this.registryAddress(), abi: ABI, functionName: 'registerInstrument', args: [instrumentId, instrumentType, specHash] },
      async () => ({ txHash: `simulated-${Date.now()}`, blockNumber: 0n }),
    );
  }

  async transferInstrumentOwnership(instrumentId: Hex, newOwner: unknown) {
    return this.write(
      { address: this.registryAddress(), abi: ABI, functionName: 'transferInstrumentOwnership', args: [instrumentId, newOwner] as never },
      async () => ({ txHash: `simulated-${Date.now()}`, blockNumber: 0n }),
    );
  }

  storageFallback() { return Promise.resolve(''); }
}

function toHexStr(value: string): Hex {
  // bytes32 id: empty -> zero bytes32 (e.g. "no supersede"), well-formed 32-byte
  // ids pass through; any other string id is keccak256'd deterministically.
  if (value.length === 0) return `0x${'0'.repeat(64)}`;
  if (value.startsWith('0x') && value.length === 66) return value as Hex;
  return keccak256(toHex(`calibragraph:${value}`));
}

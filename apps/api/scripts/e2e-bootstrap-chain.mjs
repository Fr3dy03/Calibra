/**
 * One-off registry bootstrap for the testnet E2E (idempotent where possible):
 *   registerLaboratory -> approveLaboratory -> setIssuerScope(+issuer role) -> registerInstrument
 * Uses REGISTRY_DEPLOYER_KEY from apps/api/.env (never logged, never committed).
 * Run: node --env-file=.env scripts/e2e-bootstrap-chain.mjs
 */
import { createPublicClient, createWalletClient, http, toHex, keccak256, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const chain = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
  rpcUrls: { default: { http: [process.env.BOT_TESTNET_RPC_URL ?? 'https://rpc.bohr.life'] } },
  blockExplorers: { default: { name: 'BOTScan', url: 'https://scan.bohr.life/' } },
});
const registry = process.env.REGISTRY_ADDRESS;
const abi = [
  { name: 'registerLaboratory', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'laboratoryId', type: 'bytes32' }, { name: 'profileHash', type: 'bytes32' }], outputs: [{ type: 'bool' }] },
  { name: 'approveLaboratory', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'laboratoryId', type: 'bytes32' }], outputs: [] },
  { name: 'setIssuerScope', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'issuer', type: 'address' }, { name: 'scopeHash', type: 'bytes32' }, { name: 'active', type: 'bool' }], outputs: [] },
  { name: 'registerInstrument', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'instrumentId', type: 'bytes32' }, { name: 'instrumentType', type: 'bytes32' }, { name: 'specificationHash', type: 'bytes32' }], outputs: [{ type: 'bool' }] },
  { name: 'getInstrument', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: 'instrumentId', type: 'bytes32' }, { name: 'owner', type: 'address' }, { name: 'instrumentType', type: 'bytes32' }, { name: 'specificationHash', type: 'bytes32' }, { name: 'createdAt', type: 'uint64' }, { name: 'active', type: 'bool' }] },
  { name: 'isIssuerAuthorised', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bool' }] },
  { name: 'laboratoryOfAdmin', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'address' }], outputs: [{ type: 'bytes32' }] },
];
const Z32 = `0x${'0'.repeat(64)}`;

const account = privateKeyToAccount(process.env.REGISTRY_DEPLOYER_KEY);
const client = createWalletClient({ chain, transport: http(chain.rpcUrls.default.http[0]), account });
const pub = createPublicClient({ chain, transport: http(chain.rpcUrls.default.http[0]) });

const E2E_INSTRUMENT_ID = '0x14bbd194dcbd7797f71e86cbf7e56d7d875f70ad73d14e47a11fab073420c923';
const LAB_ID = '0xac338acb030fdeaec6f25fa5e157474cd2e2153d07d720d9ae5fa995fcf04612';
const instrType = keccak256(toHex('DC voltage measurement'));
const specHash = keccak256(toHex(JSON.stringify(['DC voltage measurement', '0', '1000', 'V', '0.0000001'])));

async function send(name, args) {
  const hash = await client.writeContract({ address: registry, abi, functionName: name, args, chain: undefined });
  const r = await pub.waitForTransactionReceipt({ hash });
  console.log(`${name}: tx ${hash} status=${r.status} gas=${r.gasUsed}`);
  return hash;
}

console.log('wallet', account.address);
console.log('laboratoryOfAdmin', await pub.readContract({ address: registry, abi, functionName: 'laboratoryOfAdmin', args: [account.address] }));
console.log('isIssuerAuthorised before', await pub.readContract({ address: registry, abi, functionName: 'isIssuerAuthorised', args: [account.address] }));

try {
  await send('registerLaboratory', [LAB_ID, Z32]);
} catch (e) { console.log('registerLaboratory skipped/failed:', String(e.message).slice(0, 120)); }
try {
  await send('approveLaboratory', [LAB_ID]);
} catch (e) { console.log('approveLaboratory skipped/failed:', String(e.message).slice(0, 120)); }
try {
  await send('setIssuerScope', [account.address, keccak256(toHex('calibragraph:scope:DC/LF voltage')), true]);
} catch (e) { console.log('setIssuerScope skipped/failed:', String(e.message).slice(0, 120)); }
try {
  await send('registerInstrument', [E2E_INSTRUMENT_ID, instrType, specHash]);
} catch (e) { console.log('registerInstrument skipped/failed:', String(e.message).slice(0, 120)); }

const inst = await pub.readContract({ address: registry, abi, functionName: 'getInstrument', args: [E2E_INSTRUMENT_ID] });
console.log('instrument on-chain active:', inst[inst.length - 1]);
console.log('isIssuerAuthorised after', await pub.readContract({ address: registry, abi, functionName: 'isIssuerAuthorised', args: [account.address] }));

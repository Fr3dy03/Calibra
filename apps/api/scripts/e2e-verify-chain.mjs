/** Independent on-chain check: raw eth_call against CalibrationRegistry (no API). */
import { createPublicClient, http, defineChain, decodeFunctionResult, encodeFunctionData } from 'viem';
import { toHex, keccak256 } from 'viem';

const chain = defineChain({ id: 968, name: 't', nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 }, rpcUrls: { default: { http: ['https://rpc.bohr.life'] } } });
const pub = createPublicClient({ chain, transport: http('https://rpc.bohr.life') });
const REG = '0x28d1f6e4093769446382ca5d76c121cedb105c0a';

const certId = keccak256(toHex('calibragraph:DCC-RML-2026-0417-E2E1'));
const anchored = keccak256(toHex('sha256:67664a839ea34c2bdb3a10e4436747b3517796174e4ae3d26976810161139de7'));
// The anchor digest was the DB keccak digest 0xf62ae9... (already a bytes32) -> passed through
const digest = '0xf62ae9c40266f11f12b61b62f0c3ade0e85f156aa2a038e6a28d6d0a9c148b85';

const abi = {
  certificates: { name: 'certificates', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ name: 'certificateId', type: 'bytes32' }, { name: 'instrumentId', type: 'bytes32' }, { name: 'issuer', type: 'address' }, { name: 'certificateDigest', type: 'bytes32' }, { name: 'measurementScopeHash', type: 'bytes32' }, { name: 'referenceStandardHash', type: 'bytes32' }, { name: 'issueDate', type: 'uint64' }, { name: 'validUntil', type: 'uint64' }, { name: 'revision', type: 'uint32' }, { name: 'supersedesId', type: 'bytes32' }, { name: 'status', type: 'uint8' }] },
  anchoredDigests: [{ name: '', type: 'bytes32' }],
};

async function call(abiItem, args) {
  const data = encodeFunctionData({ abi: Array.isArray(abiItem) ? abiItem : [abiItem], functionName: Array.isArray(abiItem) ? abiItem[0].name : abiItem.name, args });
  const res = await pub.request({ method: 'eth_call', params: [{ to: REG, data }, 'latest'] });
  return res;
}

const certRaw = await pub.readContract({ address: REG, abi: [abi.certificates], functionName: 'certificates', args: [certId] });
console.log('on-chain certificates():', certRaw);
console.log('digest match:', certRaw[3] === digest);
console.log('issuer:', certRaw[2]);
console.log('status (1=Issued):', certRaw[certRaw.length - 1].toString());
const anchoredRaw = await pub.readContract({ address: REG, abi: [{ name: 'anchoredDigests', type: 'function', stateMutability: 'view', inputs: [{ name: '', type: 'bytes32' }], outputs: [{ type: 'bool' }] }], functionName: 'anchoredDigests', args: [digest] });
console.log('anchoredDigests[certificateDigest]:', anchoredRaw);
const receipt = await pub.request({ method: 'eth_getTransactionReceipt', params: ['0xecfeff8b74e67e7e04b1d7b2ab3d2714aafca2796e6611a389e7b00895bdff5f'] });
console.log('receipt status:', receipt.status, 'block:', parseInt(receipt.blockNumber, 16).toString(), 'logs:', receipt.logs.length);
const balance = await pub.request({ method: 'eth_getBalance', params: ['0x793Af076d6Fe0A94Fb9436242dC6854Ef212B1F0', 'latest'] });
console.log('deployer balance (wei):', BigInt(balance).toString());
const nonce = await pub.request({ method: 'eth_getTransactionCount', params: ['0x793Af076d6Fe0A94Fb9436242dC6854Ef212B1F0', 'latest'] });
console.log('deployer nonce:', parseInt(nonce, 16).toString());

import { createHash } from 'node:crypto';
import { keccak256 as toKeccakFromHex } from 'viem';

/** keccak256 of a hex string (e.g. keccak256("0x" + sha256hex)). */
export function keccak256(hexDigest: string): string {
  return toKeccakFromHex(`0x${hexDigest}`);
}

export function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

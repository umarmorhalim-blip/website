/** World layout. The transfer travels left → right; the chain recedes behind the block. */
import type { Vector3Tuple } from "three";

export const PHONE: Vector3Tuple = [-10, 0, 0];
export const GATE: Vector3Tuple = [-5, 0, 0];
export const BLOCK: Vector3Tuple = [0, 0, 0];
/** Where the new block locks in: the head of the chain. */
export const CHAIN_SLOT: Vector3Tuple = [0, 0, -2.6];
/** Offset from one chain block to the next older one. */
export const CHAIN_STEP: Vector3Tuple = [0, 0, -2.2];
export const CHAIN_LENGTH = 6;
export const WALLET: Vector3Tuple = [7, 0, 0.4];
export const FLOOR_Y = -1.7;

/** Camera framing per chapter (brief §4): where it sits and what it looks at. */
export const CAMERA_KEYS: { pos: Vector3Tuple; target: Vector3Tuple; arc?: number }[] = [
  { pos: [-1.5, 10.5, 27], target: [-1.5, -0.6, -2.2] }, // 0 intro: whole route
  { pos: [-9.1, 0.5, 4.6], target: [-10, 0, 0], arc: 1.5 }, // 1 close on phone
  { pos: [-2.4, 1.5, 5.8], target: [-5, 0.2, 0], arc: 0.6 }, // 2 side of the gate
  { pos: [0, 0.5, 7.2], target: [0, 0, 0], arc: 0.8 }, // 3 front of the block
  { pos: [0, 4, 9.2], target: [0, 0.2, 0], arc: 0.3 }, // 4 front, slightly high
  { pos: [7.5, 8.5, 6.5], target: [-0.5, -0.5, -5.5], arc: 1 }, // 5 high three-quarter
  { pos: [7.7, 0.7, 4.7], target: [7, 0, 0.4], arc: 1.2 }, // 6 close on wallet
];

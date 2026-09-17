import { EL_FEE } from '../constants/misc';

export const formatElFee = (requests: number): string => `~${EL_FEE * BigInt(requests)} wei xDAI`;

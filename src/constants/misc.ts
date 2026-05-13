export const SECOND_IN_DAY = 86400;
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
// TODO: EL_FEE is sent as `value` with EIP-7002 (withdrawal) and EIP-7251
// (consolidation) system-contract calls. The predeploys use a dynamic fee that
// starts at 1 wei and grows with queue pressure — sending less than the
// current fee reverts. Querying the predeploy's get_fee() before each call
// would be safer than the static floor used here.
export const EL_FEE = 1n;

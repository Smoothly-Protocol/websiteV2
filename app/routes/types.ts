export interface Validator {
  index: number, 
  eth1: string,
  rewards: { hex: string }, 
  slashMiss: number, 
  slashFee: number 
  stake: { hex: string }, 
  firstBlockProposed: boolean, 
  firstMissedSlot: boolean,  
  excludeRebalance?: boolean,
  exitRequested: boolean,
  active: boolean,
  deactivated: boolean
}

export interface NET {
  poolAddress: string,
  governanceAddress: string,
  poolAbi: any,
  governanceAbi: any, 
  stakeFee: bigint,
  missFee: bigint,
}

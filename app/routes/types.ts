export interface Validator {
  index: number, 
  eth1: string,
  rewards: number, 
  slashMiss: number, 
  slashFee: number 
  stake: number, 
  firstBlockProposed: boolean, 
  firstMissedSlot: boolean,  
  excludeRebalance?: boolean,
  exitRequested: boolean,
  active: boolean,
  deactivated: boolean
}


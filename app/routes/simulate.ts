import type { Validator } from './types';
import { getNetwork, NETWORK } from './utils';
import { Log } from 'viem';

let stakeFee, missFee;
if(typeof window == "undefined") {
  let net = getNetwork(process.env.NETWORK);
  stakeFee = net.stakeFee;
  missFee = net.missFee;
} else {
  stakeFee = NETWORK.stakeFee; 
  missFee = NETWORK.missFee; 
}

export const executeLogs = (logs, validators) => {
  try {
    for(const log of logs) {
      const {eventName, args } = log;
      switch(eventName) {
        case 'ExitRequested': {
          ExitRequested(args.indexes, validators);
          break;
        } case 'Registered': {
          Registered(args.indexes, args.eth1, validators);
          break;
        } case 'RewardsWithdrawal': {
          RewardsWithdrawal(args.indexes, validators);
          break;
        } case 'StakeAdded': {
          StakeAdded(args.index, validators);
          break;
        } case 'StakeWithdrawal': {
          StakeWithdrawal(args.indexes, validators);
          break;
        }
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const ExitRequested = async (
  indexes: bigint[], 
  validators: Validator[]
) => {
  try {
    for(const [i, validator] of validators.entries()) {
      if(indexes.includes(BigInt(validator.index))) {
        if(validator.exitRequested === false) {
          validators[i].exitRequested = true;
          console.log("update exit requested:", validator.index);
        } 
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const Registered = async (
  indexes: bigint[], 
  address: string,
  validators: Validator[]
) => {
  try {
    for(const [i, validator] of validators.entries()) {
      if(indexes.includes(BigInt(validator.index))) {
        if(!validator.rewards) {
          const newUser: Validator = {
            index: validator.index, 
            eth1: address.toLowerCase(),
            rewards: { hex: '0x0' },
            slashMiss: 0,
            slashFee: 0, 
            stake: { hex: `0x${stakeFee.toString(16)}` },
            firstBlockProposed: false, 
            firstMissedSlot: false,
            excludeRebalance: false,
            exitRequested: false,
            active: true,
            deactivated: false
          };
          validators[i] = newUser;
          console.log("update registration:", validator.index);
        } else if (validator.deactivated) {
          console.log("validator deactivated:", validator.index);
        } else if(!validator.active) {
          validators[i].active = true;
          validators[i].stake = { hex: `0x${stakeFee.toString(16)}` };
          validators[i].firstBlockProposed = false;
        } else if(validator.active) {
          console.log("validator already registered", validator.index);
        }
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const RewardsWithdrawal = async (
  indexes: bigint[], 
  validators: Validator[]
) => {
  try {
    for(const [i, validator] of validators.entries()) {
      if(indexes.includes(BigInt(validator.index))) {
        validators[i].rewards = { hex: "0x0"};
        console.log("update claim requested:", validator.index);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const StakeAdded = async (
  index: bigint, 
  validators: Validator[]
) => {
  try {
    for(const [i, validator] of validators.entries()) {
      if(index == BigInt(validator.index)) {
        validators[i].stake = { 
          hex: `0x${(BigInt(validator.stake.hex) + missFee).toString(16)}`
        };
        console.log("added bond requested:", index);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const StakeWithdrawal = async (
  indexes: bigint[], 
  validators: Validator[]
) => {
  try {
    for(const [i, validator] of validators.entries()) {
      if(indexes.includes(BigInt(validator.index))) {
        validators[i].stake = { hex: "0x0"};
        validators[i].exitRequested = false;
        if(!validator.firstBlockProposed) {
          validators[i].rewards = { hex: "0x0"};
        }
        console.log("update withdraw bond", validator.index);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

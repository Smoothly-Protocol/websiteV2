import { formatEther, Contract, Signer, getBigInt, FixedNumber } from "ethers";
import { usePublicClient } from 'wagmi';
import { NETWORK } from "./constants";

const STAKE_FEE = NETWORK.stakeFee;

export function formatEthAmount(amount: string) {
  amount = formatEther(amount); 
  return parseFloat(amount).toFixed(3);
}

export function useContract(signer: Signer): Contract {
  try {
    return new Contract(
      NETWORK.poolAddress, 
      NETWORK.poolAbi, 
      signer
    );
  } catch(err) {
    console.log(err);
  }  
}

export async function getTimeRemaining() {
  try {
    const provider = usePublicClient();
    const epochInterval = await provider.readContract({ 
      address: NETWORK.governanceAddress, 
      abi: NETWORK.governanceAbi,
      functionName: 'epochInterval'
    }); 
    const lastEpoch = await provider.readContract({ 
      address: NETWORK.governanceAddress, 
      abi: NETWORK.governanceAbi,
      functionName: 'lastEpoch'
    }); 
    const timestamp = (Number(lastEpoch) + epochInterval) * 1000;
    const total = Date.parse(new Date(timestamp)) - Date.parse(new Date());
    const seconds = Math.floor( (total/1000) % 60 );
    const minutes = Math.floor( (total/1000/60) % 60 );
    const hours = Math.floor( (total/(1000*60*60)) % 24 );
    const days = Math.floor( total/(1000*60*60*24) );
    return {
      total,
      days,
      hours,
      minutes,
      seconds
    };
  } catch(err) {
    console.log(err);
  }
}

export const status = (validator: any): string => {
  if(typeof validator.active === 'undefined') {
    return "Unregistered";
  } else if(validator.exitRequested) {
    return "Exit Requested";
  } else if(validator.active && !validator.firstBlockProposed) {
    return "Pending";
  } else if(!validator.active) {
    if(validator.stake.hex <= 0 && validator.rewards.hex <= 0) {
      return "Unregistered";
    }
    return "Exited";
  } 
  return "Active";
};

export const state = (validator: any): string => {
  if(!validator.stake) { return "Good" }
  let fee = FixedNumber.fromValue(STAKE_FEE);
  let stake = FixedNumber.fromValue(validator.stake.hex); 
  if(validator.deactivated || validator.slashFee > 0) {
    return "Deactivated";
  } else if(!validator.active && validator.stake.hex <= 0 && validator.rewards.hex <= 0) {
  } else if(validator.firstMissedProposal && fee.eq(stake) && validator.slashMiss === 0) {
    return "First Missed Proposal"
  } else if((!fee.eq(stake) && validator.active)  || validator.slashMiss > 0 || validator.slashFee > 0) {
    return "Penalized";
  } 
  return "Good";
}

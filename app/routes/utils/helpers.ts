import { formatEther, Contract, Signer, getBigInt, FixedNumber } from "ethers";
import { NETWORK } from "./constants";
import { BaseError, ContractFunctionRevertedError } from 'viem';

export function formatEthAmount(amount: string) {
  amount = formatEther(amount); 
  return parseFloat(amount).toFixed(3);
}

export const claimed = async (client, { functionName, args, account}) => {
  try {
    const { request } = await client.simulateContract({
      address: NETWORK.poolAddress,
      abi: NETWORK.poolAbi,
      functionName,
      account, 
      args    
    });
    return false;
  } catch(err) {
    if (err instanceof BaseError) {
      const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
      if (revertError instanceof ContractFunctionRevertedError) {
        const errorName = revertError.data?.errorName ?? ''
        // do something with `errorName`
        if(errorName == 'AlreadyClaimed') {
          return true;
        }
      }
    }
  }
}

export async function getTimeRemaining(provider) {
  try {
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
  let fee = FixedNumber.fromValue(NETWORK.stakeFee);
  let stake = FixedNumber.fromValue(validator.stake.hex); 
  if(validator.slashMiss > 0) {
    return "Missed block proposal";
  } else if(validator.slashFee > 0) {
    return "Wrong fee recipient";
  } else if(validator.excludeRebalance) {
    return "Relay incorrect fee recipient"
  } else if(!fee.eq(stake) && validator.active) {
    return "Penalized"
  }
  return "Good";
}

export const tooltip1 = (validator: any): string => {
  const st = status(validator);
  switch(st) {
    case 'Unregistered': {
      return "This validator has not been registered with Smoothly, join the pool party!";
    } 
    case 'Exit Requested': {
      return "This validator has requested an exit. When the current rewards cycle concludes, you’ll be able to withdraw your bond." 
    } 
    case 'Exited': {
      return "This validator has exited Smoothly"
    } 
    case 'Pending': {
      return "This validator is accruing rewards which will become claimable upon your next block proposal!"
    } 
    case 'Active': {
      return "This validator is active and accruing rewards!"
    }
  }
}

export const tooltip2 = (validator: any): string => {
  const st1 = status(validator);
  const st2 = state(validator);
  switch(st1) {
    case 'Pending': {
      if(st2 == 'Missed block proposal') {
        return "This validator missed a block proposal, your accrued rewards will be added to the pool.";
      } else if(st2 == "Wrong fee recipient") {
        return "This validator proposed a block with an incorrect fee recipient, your accrued rewards will be added to the pool.";
      } else if(st2 == "Relay incorrect fee recipient") {
        return "This validator was caught changing their fee recipient, it will be excluded from the current reward cycle."
      }
    } 
    case 'Active': {
      if(st2 == 'Missed block proposal') {
        return "This validator missed a block proposal, you’re excluded from this rewards cycle, and will be penalized 0.15E if you already missed a block";
      } else if(st2 == "Wrong fee recipient") {
        return "This validator proposed a block with an incorrect fee recipient, you’re entire bond has been added to the pool and you’ve been forced exited from Smoothly.";
      } else if(st2 == "Relay incorrect fee recipient") {
        return "This validator was caught changing their fee recipient, it will be excluded from the current reward cycle."
      } else if(st2 == "Penalized") {
        return "This validator has been penalized and some or all of the bond has been added to the pool."
      }
    }
    case 'Exit Requested': {
      if(st2 == 'Missed block proposal') {
        return "This validator missed a block proposal, you’re excluded from this rewards cycle, and will be penalized 0.15E if you already missed a block";
      } else if(st2 == "Wrong fee recipient") {
        return "This validator proposed a block with an incorrect fee recipient, you’re entire bond has been added to the pool and you’ve been forced exited from Smoothly.";
      } else if(st2 == "Relay incorrect fee recipient") {
        return "This validator was caught changing their fee recipient, it will be excluded from the current reward cycle."
      }
    }
  }
}

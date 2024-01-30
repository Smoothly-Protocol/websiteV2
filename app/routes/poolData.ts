import type { Validator } from "./types";

const server = process.env.SERVER; 
const api = process.env.BEACONCHAIN;

export const getValidators = async (address: string) => {
  try {
    const d = await (
      await fetch(`${server}/validators/${address}`)
    ).json();

    if(process.env.NETWORK == 'goerli') {
      return d.data;
    }

    let validators = [];
    for(const [i, v] of d.data.entries()) {
      if(d.data.findIndex(x => x.index == v.index) != i) {continue} // Avoid Dups
      const url = `${api}/api/v1/validator/${v.index}`;
      const { data } = await (
        await fetch(url)
      ).json();

      // Verify activeness 
      if(
        data.status == 'active_offline' || 
        data.status == 'active_online' || 
         v.stake
      ) {
        validators.push(v);
      }
    }

    validators = await updateValidatorState(validators);
    return validators;
  } catch(err) {
    console.log(err);
    console.log("Couldn't get validators from oracle");
    return [];
  }
}

export const updateValidatorState = async (
  validators: Validator[]
): Promise<Validator[]> => {
  try {
    const epochs = await Promise.all([reqEpoch("finalized"),reqEpoch("latest")]);
    const [finalized, latest] = epochs.sort();
  
    for(let epoch = finalized; epoch <= latest; epoch++) {
      console.log(epoch);
    }

   return validators; 
  } catch(err) {
    console.log(err);
    throw "Error updating validators";
  }
};

export const getWithdrawals = async (address: string) => {
  try {
    return await (
      await fetch(`${server}/tree/withdrawals/${address}`)
    ).json();
  } catch {
    console.log("Couldn't get withdrawals from oracle");
    return { proof: [] };
  }
}

export const getExits = async (address: string) => {
  try {
    return await (
      await fetch(`${server}/tree/exits/${address}`)
    ).json();
  } catch {
    console.log("Couldn't get withdrawals from oracle");
    return { proof: [] };
  }
}

export const getPool = async () => {
  try {
    return await (
      await fetch(`${server}/poolstats`)
    ).json();
  } catch {
    console.log("Couldn't get validators from oracle");
    return {};
  }
}

const reqEpoch = async (_epoch: string) => {
  try { 
    const { data } = await(
      await fetch(`${api}/api/v1/epoch/${_epoch}`)
    ).json();
    return data.epoch;
  } catch {
    throw "Beacon chain not responding";
  }
}

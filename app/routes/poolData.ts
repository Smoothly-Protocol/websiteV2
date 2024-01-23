const server = process.env.SERVER; 
const api = process.env.BEACONCHAIN;

export const getValidators = async (address: string) => {
  try {
    const { data } = await (
      await fetch(`${server}/validators/${address}`)
    ).json();

    let validators = [];
    for(let v of data) {
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
    return validators;
  } catch(err) {
    console.log(err);
    console.log("Couldn't get validators from oracle");
    return [];
  }
}

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

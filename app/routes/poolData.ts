import type { Validator } from "./types";
import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet, holesky } from 'viem/chains'
import { getNetwork } from './utils';
import { executeLogs } from './simulate';
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Validators } from './mock/validators';

const server = process.env.SERVER; 
const api = process.env.BEACONCHAIN;
const network = process.env.NETWORK;

const { rpc } = getNetwork(network as string);
const publicClient = createPublicClient({
  chain: network == "mainnet" ? mainnet : holesky,
  transport: http(rpc)
})

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const addr = url.searchParams.get("addr") as string;
    const [
      validators,
      withdrawals,
      exits
    ] = await Promise.all([
      getValidators(addr),
      getWithdrawals(addr),
      getExits(addr),
    ]);
    return json({ validators, withdrawals, exits });
  } catch(err) {
    console.log(err)
  }
};

export const getValidators = async (address: string) => {
  try {
    let validators: Validator[] = [];
    const d = await (
      await fetch(`${server}/validators/${address}`)
    ).json();

    /*
    // Mock Validators Testing
    const d = {
      data: Validators
    };*/

    // Avoids status check on testnet
    if(process.env.NETWORK == 'holesky') {
      await updateValidatorState(d.data, address);
      return d.data;
    }

    for(const [i, v] of d.data.entries()) {
      if(d.data.findIndex(x => x.index == v.index) != i) {continue} // Avoid Dups
      if(!v.index) { continue } // Avoid queue validators index == null

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

    await updateValidatorState(validators, address);
    return validators;
  } catch(err) {
    console.log(err);
    console.log("Couldn't get validators from oracle");
    return [];
  }
}

export const updateValidatorState = async (
  validators: Validator[],
  address: string
) => {
  try {
    const finalized = await publicClient.getBlock({ blockTag: 'finalized'});
    const latest = await publicClient.getBlock({ blockTag: 'latest'});
    const { poolAddress } = getNetwork(network as string);
    const logs = await publicClient.getLogs({  
      address: poolAddress,
      events: parseAbi([
        'event Registered(address indexed eth1, uint64[] indexes)',
        'event RewardsWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)',
        'event StakeWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)',
        'event StakeAdded(address indexed eth1, uint64 index, uint256 value)',
        'event ExitRequested(address indexed eth1, uint64[] indexes)'
      ]),
      fromBlock: finalized.number,
      toBlock: latest.number
    })
    executeLogs(logs, validators);
  } catch(err) {
    console.log(err);
    return validators;
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

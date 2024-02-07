import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /registerValidate
const api = process.env.BEACONCHAIN;

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const data = [];
    const { indexes, address, validators } = await request.json();
    const info = await getValidators(address, api);

    // Validation
    for(const validator of validators) {
      if(indexes.includes(validator.index)) {
        const { verified, index } = proofOwnership(address, validator.index, info);
        if(verified) {
          if(!validator.rewards) {
            data.push({ index: index, status: 'ok' });
          } else if (validator.deactivated) {
            data.push({ index: index, status: 'deactivated' });
          } else if(validator.active) {
            data.push({ index: index, status: 'already registered' });
          } 
        } else {
            data.push({ index: index, status: 'unowned' });
        }
      }
    }

    return json(
      { 
        ok: true,
        data: data
      }, 
      {
        status: 200,
      } 
    );
  } catch(err: any) {
    console.log(err);
    return json({ ok: false }, 401)
  }
};

function proofOwnership(
  eth1Addr: string, 
  id: number, 
  data: Array<any>
): {verified: boolean, index: number} {
  const len = data.length;
  let verified: boolean = false;
  let index: number = 0;
  if(len > 0) {
    for(let i = 0; i < len; i++) {
      if(data[i].validatorindex == id) {
        verified = true;
        index = Number(data[i].validatorindex);
          return { verified, index }; 
      }
    }
  }
  return { verified, index: id };
}

export async function getValidators(eth1Addr: string, url: string): Promise<Array<ValidatorInfo>> {
  try {
    const deposit = `${url}/api/v1/validator/eth1/${eth1Addr}`;
    const withdrawal = `${url}/api/v1/validator/withdrawalCredentials/${eth1Addr}`;
    const headers = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    }

    let data: Array<ValidatorInfo> = [];
    const validatorsDeposit = await(await fetch(deposit, headers)).json();
    validatorsDeposit.status === "OK" 
      ? data = data.concat(validatorsDeposit.data) 
      : 0;

    const validatorsWithdrawal = await(await fetch(withdrawal, headers)).json();
    validatorsWithdrawal.status === "OK" 
      ? data = data.concat(validatorsWithdrawal.data) 
      : 0;

    return data;
  } catch(err: any) {
    throw err;
  }
}


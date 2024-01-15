import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /register
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const { indexes } = await request.json();
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (session.has('validators')) {
      let validators = session.get('validators');
      const eth1Addr = session.get('siwe').data.address;

      // Update validators
      for(let index of indexes) {
        for(let [i, validator] of validators.entries()) {
          if(index === validator.index) {
            if(!validator.rewards) {
              const newUser: Validator = {
                index: index, 
                 eth1: eth1Addr.toLowerCase(),
                 rewards: { hex: '0x0' },
                 slashMiss: 0,
                 slashFee: 0, 
                 stake: { hex: `0x${NETWORK.stakeFee.toString(16)}` },
                 firstBlockProposed: false, 
                 firstMissedSlot: false,
                 excludeRebalance: false,
                 exitRequested: false,
                 active: true,
                 deactivated: false
              };
              validators[i] = newUser;
              console.log("update registration:", index);
            } else if (validator.deactivated) {
              console.log("validator deactivated:", index);
            } else if(!validator.active) {
              validators[i].active = true;
              validators[i].stake = { hex: `0x${NETWORK.stakeFee.toString(16)}` };
              validators[i].firstBlockProposed = false;
            } else if(validator.active) {
              console.log("validator already registered", index);
            }
          }
        }
      }
    }

    const cookie = await commitSession(session);

    return json(
      { 
        ok: true 
      }, 
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie,
        }
      } 
    );
  } catch(err: any) {
    console.log(err);
    return json({ ok: false }, 401)
  }
};


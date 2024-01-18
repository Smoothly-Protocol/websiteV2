import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /withdrawBond
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    let validators = [];
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (session.has('exits')) {
      let exits = session.get('exits');
      validators = session.get('validators');

      // Update validators
      for(let index of exits.proof[1]) {
        for(let [i, validator] of validators.entries()) {
          if(index === validator.index) {
            validators[i].stake = { hex: "0x0"};
            validators[i].exitRequested = false;
            if(!validators[i].firstBlockProposed) {
              validators[i].rewards = { hex: "0x0"};
            }
            console.log("update withdraw bond", index);
          }
        }
      }

      session.set('exits', { proof: [] })
    }

    const cookie = await commitSession(session);

    return json(
      { 
        ok: true,
        data: validators 
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


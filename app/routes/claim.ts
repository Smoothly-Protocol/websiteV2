import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /claim
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (session.has('withdrawals')) {
      let withdrawals = session.get('withdrawals');
      let { data } = session.get('validators');

      for(let index of withdrawals.proof[1]) {
        for(let [i, validator] of data.entries()) {
          if(index === validator.index) {
                data[i].rewards = { hex: "0x0"};
          }
        }
      }

      session.set('withdrawals', { proof: [] })
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


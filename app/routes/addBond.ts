import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /addbond
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const { index } = await request.json();
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (session.has('validators')) {
      let { data } = session.get('validators');

      // Update validators
      for(let [i, validator] of data.entries()) {
        if(index === validator.index) {
            data[i].stake = { 
              hex: `0x${(BigInt(data[i].stake.hex) + NETWORK.missFee).toString(16)}`
            };
            console.log("added bond requested:", index);
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


import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';
import { NETWORK } from './utils/constants';

// POST - /exits
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    const { indexes } = await request.json();
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (session.has('validators')) {
      let { data } = session.get('validators');

      // Update validators
      for(let index of indexes) {
        for(let [i, validator] of data.entries()) {
          if(index === validator.index) {
            if(validator.exitRequested === false) {
              data[i].exitRequested = true;
              console.log("update exit requested:", index);
            } 
          }
        }
      }

      session.set('validators', { data })
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


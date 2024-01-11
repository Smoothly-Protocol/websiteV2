import type { ActionFunctionArgs } from "@remix-run/node"; 
import { json } from "@remix-run/node"; 
import { getSession, commitSession } from "../sessions";
import { SiweMessage } from 'siwe';

// POST - /auth/verify
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  try {
    // Verify signature
    const { message, signature } = await request.json();
    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({signature});
                    
    const session = await getSession(
      request.headers.get("Cookie")
    );

    if (fields.data.nonce !== session.get('nonce')) {
      return json({ message: 'Invalid nonce.' }, 422);
    }

    session.set('siwe', fields);
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
    return json({ ok: false }, 401)
  }
};


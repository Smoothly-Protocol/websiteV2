import type { LoaderFunctionArgs } from "@remix-run/node"; 
import { json, redirect } from "@remix-run/node"; 
import { generateNonce } from 'siwe';
import { getSession, commitSession } from "../sessions";

// GET - /auth/nonce
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );

  const nonce = generateNonce();
  session.set('nonce', nonce);
  const cookie = await commitSession(session);

  return new Response(nonce, {
    headers: {
      "Content-Type": "plain/text",
      "Set-Cookie": cookie
    },
  });
};


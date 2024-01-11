import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession, destroySession } from "../sessions";

// DELETE - /auth/logout 
export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  return redirect("/", {
     headers: {
       "Set-Cookie": await destroySession(session),
     },
   });
};


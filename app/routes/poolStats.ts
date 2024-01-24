import { getPool } from './poolData';
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// GET - /poolstats 
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
  const data = await getPool();
  return json({ ok: true, data });
  } catch {
  return json({ ok: false, data: [] });
  }
};


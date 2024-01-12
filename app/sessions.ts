import { createCookieSessionStorage } from "@remix-run/node"; 

type SessionData = {
  nonce: string,
  siwe: any
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      cookie: {
        name: "smoothly",
        secrets: ["loisdfasdfadfl"],
      },
    }
  );

export { getSession, commitSession, destroySession };


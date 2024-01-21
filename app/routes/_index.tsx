import {
  getDefaultWallets,
  RainbowKitProvider,
  RainbowKitAuthenticationProvider,
  createAuthenticationAdapter
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { SiweMessage } from 'siwe';
import type { MetaFunction } from "@remix-run/node";
import { Header, Footer, App } from "./components";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import { Validators } from './mock/validators'; // Remove - only testing
import { getValidators, getWithdrawals, getExits, getPool } from './poolData.ts';
import { terms } from './utils';
import { useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "Smoothly Pool" },
    { name: "description", content: "MEV Smoothing Pool for Solo Stakers" },
  ];
};

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  try {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  
  // Query pool data
  let pool = await getPool();

  // Verify auth
  let signed = session.has('siwe');
  if(session.has('siwe')) {
    const siwe = session.get('siwe');
    const addr = siwe.data.address;
    let validators, withdrawals, exits, terms;

    // Update session
    terms = session.has('validators');
    session.has('validators')
      ? 0 
      : session.set('validators', (await getValidators(addr)));

    session.has('withdrawals')
      ? 0 
      : session.set('withdrawals', (await getWithdrawals(addr)));

    session.has('exits')
      ? 0 
      : session.set('exits', (await getExits(addr)));



    const cookie = await commitSession(session);

    return json({
      status: "authenticated",
      pool: pool,
      terms: terms,
      signed: signed,
      validators: session.get("validators"),
      withdrawals: session.get("withdrawals"),
      exits: session.get("exits")
    }, {
      headers: {
        "Set-Cookie": cookie,
      }
    });
  } else {
    return json({ status: "unauthenticated", pool: pool});
  }
  } catch(err) {
    console.log(err)
  }
};

export default function Index() {
  const { chains, publicClient } = configureChains([goerli], [publicProvider()]);

  const { connectors } = getDefaultWallets({
    appName: 'Smoothly Protocol',
    projectId: 'f9e76686c044fd14d745ea9029c1a27a',
    chains
  });

  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
  });

  const { 
    status, 
    validators,
    withdrawals,
    exits,
    pool,
    signed,
    terms
  } = useLoaderData<typeof loader>();

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch('/auth/nonce');
      return await response.text();
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: terms,
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      });
    },

    getMessageBody: ({ message }) => {
      return message.prepareMessage();
    },

    verify: async ({ message, signature }) => {
      const verifyRes = await fetch('/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });

      window.location.href = '/';
      return Boolean(verifyRes.ok);
    },

    signOut: async () => {
      await fetch('/auth/logout', { method: "POST" }); 
    },
  });

  return (
      <>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={status}
        >
          <RainbowKitProvider chains={chains}>
            <div id="main">
              <Header/>
              <App 
                validators={validators}
                withdrawals={withdrawals}
                exits={exits}
                signed={signed}
                terms={terms}
                />
              <Footer pool={pool}/>
            </div>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </WagmiConfig>
      </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
}


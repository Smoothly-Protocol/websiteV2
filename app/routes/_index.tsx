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
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
//import { Validators } from './mock/validators'; // Remove - only testing
import { getValidators, getWithdrawals, getExits, getPool, updateValidatorState } from './poolData';
import { changeNetwork } from './utils';

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
  const network = process.env.NETWORK;
  const session = await getSession(
    request.headers.get("Cookie")
  );
  
  // Query pool data
  const pool = await getPool();

  updateValidatorState();

  // Verify auth
  const signed = session.has('siwe');
  if(session.has('siwe')) {
    const siwe = session.get('siwe');
    const addr = siwe.data.address;

    // Update session
    const terms = session.has('validators');
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
      exits: session.get("exits"),
      network
    }, {
      headers: {
        "Set-Cookie": cookie,
      }
    });
  } else {
    return json({ status: "unauthenticated", pool: pool, network});
  }
  } catch(err) {
    console.log(err)
  }
};

export default function Index() {
  const { 
    status, 
    validators,
    withdrawals,
    exits,
    pool,
    signed,
    terms,
    network
  } = useLoaderData<typeof loader>();
  
  let net = goerli;
  if(network == 'mainnet') {
    changeNetwork(network);
    net = mainnet;
  } else if(network == 'goerli') {
    changeNetwork(network);
  }

  const { chains, publicClient } = configureChains([net], [publicProvider()]);

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


  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch('/auth/nonce');
      return await response.text();
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: "you agree to the Terms of Service, which can be found at: https://docs.smoothly.money/terms-of-service",
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
      let modal = document.querySelector('#loaderModal');
      let spinner = window.bootstrap.Modal.getOrCreateInstance(modal);
      spinner.show();

      await fetch('/auth/logout', { method: "POST" }); 
      window.location.reload();
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
                adapter={authenticationAdapter}
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


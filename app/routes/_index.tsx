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
import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";

export const meta: MetaFunction = () => {
  return [
    { title: "Smoothly Pool" },
    { name: "description", content: "MEV Smoothing Pool for Solo Stakers" },
  ];
};

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

const server = 'https://node-goerli.smoothly.money';//'http://localhost:4040' 
const getOracleData = async (address: string): Promise<any> => {
  try {
    const validators  = await (
      await fetch(`${server}/validators/${address}`)
    ).json();
    const withdrawals  = await (
      await fetch(`${server}/tree/withdrawals/${address}`)
    ).json();
    const exits  = await (
      await fetch(`${server}/tree/exits/${address}`)
    ).json();
    const pool  = await (
      await fetch(`${server}/poolstats`)
    ).json();
    return { 
      validators: validators, 
      pool: pool,
      withdrawals: withdrawals,
      exits: exits
    };
  } catch {
    throw "Couldn't get data from oracle";
  }
}

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const session = await getSession(
    request.headers.get("Cookie")
  );
  
  // Verify auth
  if(session.has('siwe')) {
    const siwe = session.get('siwe');
    let { 
      validators, 
      pool,
      withdrawals,
      exits
    } = await getOracleData(siwe.data.address);

    // Update session
    session.has('validators')
      ? validators = session.get('validators')
      : session.set('validators', validators);

    session.has('withdrawals')
      ? withdrawals = session.get('withdrawals')
      : session.set('withdrawals', withdrawals);

    session.has('exits')
      ? exits = session.get('exits')
      : session.set('exits', exits);

    const cookie = await commitSession(session);

    return json({
      status: "authenticated",
      pool: pool, 
      validators: validators,
      withdrawals: withdrawals,
      exits: exits
    }, {
      headers: {
        "Set-Cookie": cookie,
      }
    });
  } else {
    return json({ status: "unauthenticated" });
  }
};

export default function Index() {
  const { status } = useLoaderData<typeof loader>();
  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const response = await fetch('/auth/nonce');
      return await response.text();
    },

    createMessage: ({ nonce, address, chainId }) => {
      return new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Authenticate to use Smoothly.',
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
      window.location.href = '/';
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
          {/* status === "authenticated" ? 
            <Dashboard/> : <Landing/> 
          */}<Dashboard/>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </WagmiConfig>
      </>
  );
}

const Landing = () => {
  return (
    <h1> This will be a nice Landing Page </h1>
  );
}

const Dashboard = () => {
  return (
    <div id="main">
      <Header/>
      <App/>
      <Footer/>
    </div>
  );
}


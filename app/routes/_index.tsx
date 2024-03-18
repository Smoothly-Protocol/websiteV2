import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, holesky } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import type { MetaFunction } from "@remix-run/node";
import { Header, Footer, App } from "./components";
import { json } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { getPool } from './poolData';
import { changeNetwork } from './utils';

export const meta: MetaFunction = () => {
  return [
    { title: "Smoothly Pool" },
    { name: "description", content: "MEV Smoothing Pool for Solo Stakers" },
  ];
};

export const loader = async () => {
  try {
    const network = process.env.NETWORK;
    const pool = await getPool();
    return json({ pool: pool, network});
  } catch(err) {
    console.log(err)
  }
};

export default function Index() {
  const { pool, network } = useLoaderData<typeof loader>();

  let net = holesky;
  if(network == 'mainnet') {
    changeNetwork(network);
    net = mainnet;
  } else if(network == 'holesky') {
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

  return (
      <>
      <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <div id="main">
              <Header/>
              <App />
              <Footer pool={pool}/>
            </div>
          </RainbowKitProvider>
      </WagmiConfig>
      </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
}


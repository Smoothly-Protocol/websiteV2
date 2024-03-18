import { parseEther } from "ethers";
import { SmoothlyPool, PoolGovernance } from "../artifacts";
import type { NET } from '../types';

const HOLESKY: NET = {
  poolAddress: "0xdDdaBb545F2dc906259A9a26C33095a37f5AB1F9",
  governanceAddress: "0x9aF9D23c1efC2f94F49eFa1eAD7c5eC36b5f584E",
  poolAbi: SmoothlyPool['abi'],
  governanceAbi: PoolGovernance['abi'], 
  stakeFee: parseEther("0.05"),
  missFee: parseEther("0.015"),
  rpc: "https://ethereum-holesky-rpc.publicnode.com"
}

const MAINNET: NET = { 
  poolAddress: "0x43670D6f39Bca19EE26462f62339e90A39B01e34",
  governanceAddress: "0xc7Ea6FF9bE0aE48A3E2C968076E6b1fd921c06EB",
  poolAbi: SmoothlyPool['abi'],
  governanceAbi: PoolGovernance['abi'], 
  stakeFee: parseEther("0.5"),
  missFee: parseEther("0.15"),
  rpc: "https://eth-mainnet.g.alchemy.com/v2/uSoMXts2cuKz0KmbKHNdwqK1X4YYpwT_"
}

export let NETWORK = HOLESKY; 
export const changeNetwork = (network: string) =>  {
  if(network == 'holesky') {
    NETWORK = HOLESKY; 
  } else if(network == 'mainnet') {
    NETWORK = MAINNET; 
  }
}

export const getNetwork = (network: string): NET =>  {
  if(network == 'holesky') {
    return HOLESKY; 
  } else if(network == 'mainnet') {
    return MAINNET; 
  }
  return HOLESKY;
}

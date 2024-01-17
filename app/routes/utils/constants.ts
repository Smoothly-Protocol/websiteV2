import { parseEther } from "ethers";
import { SmoothlyPool, PoolGovernance } from "../artifacts";

const GOERLI = {
  poolAddress: "0x894F0786cb41b1c1760E70d61cB2952749Da6382",
  governanceAddress: "0x08E23BC6565294136eaed19953Ff547f6d452699",
  poolAbi: SmoothlyPool['abi'],
  governanceAbi: PoolGovernance['abi'], 
  stakeFee: parseEther("0.065"),
  missFee: parseEther("0.015"),
}

const MAINNET = { 
  poolAddress: "0x43670D6f39Bca19EE26462f62339e90A39B01e34",
  governanceAddress: "0xc7Ea6FF9bE0aE48A3E2C968076E6b1fd921c06EB",
  poolAbi: SmoothlyPool['abi'],
  governanceAbi: PoolGovernance['abi'], 
  stakeFee: parseEther("0.5"),
  missFee: parseEther("0.15"),
}

export let NETWORK = GOERLI; 


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

export const NETWORK = GOERLI;


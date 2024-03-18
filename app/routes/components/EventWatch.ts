import { NETWORK } from "../utils";
import { parseAbi, createPublicClient, http } from 'viem';
import { mainnet, holesky } from 'viem/chains'
import { executeLogs } from '../simulate';
import { useState, useEffect } from 'react';
import { 
  useAccount, 
  usePublicClient, 
} from 'wagmi';

export const EventWatch = (props: {validators, setValidators}) => {
  const client = createPublicClient({
    chain: NETWORK.rpc.includes('mainnet') ? mainnet : holesky,
    transport: http(NETWORK.rpc)
  });
  const { address, status } = useAccount();
  const [loaded, setLoaded] = useState(false);
  let unwatch; 

  const handleLogs = (logs) => {
    let validators = props.validators;
    console.log(logs);
    executeLogs(logs, validators);
    props.setValidators(validators);
  }

  useEffect(() => {
    if(props.validators.length > 0 && !loaded) {
      console.log("Loading event watcher...");
      client.watchEvent({
        address: NETWORK.poolAddress, 
        events: parseAbi([
          "event Registered(address indexed eth1, uint64[] indexes)",
          "event RewardsWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)",
          "event StakeWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)",
          "event StakeAdded(address indexed eth1, uint64 index, uint256 value)",
          "event ExitRequested(address indexed eth1, uint64[] indexes)",
        ]),
        onLogs: logs => handleLogs(logs),
      });
      setLoaded(true);
    }
  }, [props.validators]);

  return null
}


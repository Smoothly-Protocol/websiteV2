import { NETWORK } from "../utils";
import { decodeEventLog, Log, parseAbi } from 'viem';

const handleLogs = async (logs) => {
  /*
  const { eventName, args } = decodeEventLog({ 
    abi: NETWORK.poolAbi,
    data: logs[0].data,
    topics: logs[0].topics 
  });
 */
  
  console.log(logs);
}

let unwatch: () => void | undefined;
export const EventWatch = (client, address) => {
  client.watchEvent({
    address: NETWORK.poolAddress,
    events: parseAbi([
      "event Registered(address indexed eth1, uint64[] indexes)",
      "event RewardsWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)",
      "event StakeWithdrawal(address indexed eth1, uint64[] indexes, uint256 value)",
      "event StakeAdded(address indexed eth1, uint64 index, uint256 value)",
      "event ExitRequested(address indexed eth1, uint64[] indexes)"
    ]),
    onLogs: logs => handleLogs(logs),
  });
}


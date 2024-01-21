import { NETWORK } from "../utils";
import { decodeEventLog } from 'viem';

const handleLogs = async (logs, v) => {
  const { validators, setValidators } = v;
  const { eventName, args } = decodeEventLog({ 
    abi: NETWORK.poolAbi,
    data: logs[0].data,
    topics: logs[0].topics 
  });

  // Parse only user logs
  if(validators[0].eth1 != args.eth1.toLowerCase()) {
    return;
  }

  switch(eventName) {
    case 'ExitRequested': {
      const req = await fetch('/exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: args.indexes.map(x => Number(x)) }),
      });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
      }
    } case 'Registered': {
      const req = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: args.indexes.map(x => Number(x)) }),
      });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
      }
    } case 'RewardsWithdrawal': {
      await fetch('/claim', { method: 'POST' });
    }
  }
}

const handleErrors = (error) => {
  console.log(error);
}

export const EventWatch = (client, validators) => {
  const unwatch = client.watchEvent({
    address: NETWORK.poolAddress,
    onLogs: logs => handleLogs(logs, validators),
    onError: error => handleErrors(error)    
  });
}


import React, { createContext, useState, useEffect } from 'react';
import { Table } from "./Table";
import { Modal, SessionTerms, RequestModal } from "./disclaimer";
import { NETWORK, useContract } from "../utils";
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getTimeRemaining, formatEthAmount } from '../utils';
import { useLoaderData } from "@remix-run/react";
import { Loader } from "./Loader";
import { Alert } from "./Alert";

export const SelectContext = createContext();

export const App = (props: {validators: [], withdrawals: {}, exits: {}}) => {
  const client = usePublicClient();
  const { address, status } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { terms, signed } = useLoaderData<typeof loader>();
  const [validators, setValidators] = useState(props.validators);
  const [withdrawals, setWithdrawals] = useState(props.withdrawals);
  const [exits, setExits] = useState(props.exits);
  const [days, setDays] = useState();
  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [selectedS, setSelectedS] = useState([]);
  const [selectedE, setSelectedE] = useState([]);
  const [alert, setAlert] = useState();
  const [hash, setHash] = useState();

  const load = async () => {
    const d = await getTimeRemaining();
    setDays(d.days);
    setHours(d.hours);
    setMinutes(d.minutes);
  };

  load();

  const time = () => {
    if(days > 0) {
     return `${days} days`; 
    } else if (hours > 0) {
     return `${hours} hours`; 
    } else if (minutes > 0) {
     return `${minutes} minutes`; 
    }
    return '';
  }

  const Rewards = () => {
    try {
      return formatEthAmount(withdrawals.proof[2].hex)
    } catch {
      return 0;
    }
  }

  const Bond = () => {
    try {
      return formatEthAmount(exits.proof[2].hex)
    } catch {
      return 0;
    }
  }

  const Cancel = () => {
    setSelectedE([]);
    setSelectedS([]);
  }

  // Web3 Action calls
  const Subscribe = async () => {
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      setHash(true);
      const hash = await walletClient.writeContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'registerBulk',
        account: address, 
        args: [selectedS],
        value: NETWORK.stakeFee * BigInt(selectedS.length),
      });

      // Wait
      const reciept = await client.waitForTransactionReceipt({ hash });
      const req = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: selectedS }),
      });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
      }

      // Reset
      setHash(false);
      setSelectedS([]);
      setAlert("Successfully Subscribed Validators");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const Claim = async () => {
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      setHash(true);
      const hash = await walletClient.writeContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'withdrawRewards',
        account: address, 
        args: [
          withdrawals.proof[0], 
          withdrawals.proof[1], 
          withdrawals.proof[2].hex
        ]
      });

      // Wait
      const reciept = await client.waitForTransactionReceipt({ hash });
      await fetch('/claim', { method: 'POST' });
      setWithdrawals({ proof: [] });

      // Reset
      setHash(false);
      setAlert("Successfully Claimed Rewards");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const RequestExit = async () => {
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      setHash(true);
      const hash = await walletClient.writeContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'requestExit',
        account: address, 
        args: [selectedE]
      });

      // Wait
      const reciept = await client.waitForTransactionReceipt({ hash });
      const req = await fetch('/exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: selectedE }),
      });
      const res = await req.json();

      if(res.ok) {
        setValidators(res.data);
      }

      // Reset
      setHash(false);
      setSelectedE([]);
      setAlert("Successfully Requested Exit");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const WithdrawBond = async () => {
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      setHash(true);
      const hash = await walletClient.writeContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'withdrawStake',
        account: address, 
        args: [
          exits.proof[0], 
          exits.proof[1], 
          exits.proof[2].hex
        ]
      });

      // Wait
      const reciept = await client.waitForTransactionReceipt({ hash });
      const req = await fetch('/withdrawBond', { method: 'POST' });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
        setWithdrawals({ proof: [] });
      }

      // Reset
      setHash(false);
      setAlert("Successfully Witdhraw Bonds");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const AddBond = async (index) => {
    try {
      // Write 
      const [address] = await walletClient.getAddresses();
      setHash(true);
      const hash = await walletClient.writeContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'addStake',
        account: address, 
        args: [index],
        value: NETWORK.missFee,
      });

      // Wait
      const reciept = await client.waitForTransactionReceipt({ hash });
      const verifyRes = await fetch('/addbond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index: index }),
      });

      // Reset
      setHash(false);
      setAlert("Successfully Added Bond");
    } catch(err: any) {
      setHash(false);
      if(!err.message.includes('User rejected the request')) {
        setAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  useEffect(() => {
    if(status == 'disconnected') {
      setValidators([]); 
    } else if(status == 'connected') {
      setValidators(props.validators); 
    }
  }, [status]);

  return(
    <div className="container-fluid d-flex flex-column pt-5 pb-3">

      {/* Modals */}
      <Modal selected={selectedS} Subscribe={Subscribe}/> 
      <Loader hash={hash}/>
      <Alert text={alert} setText={setAlert}/>
      <SessionTerms show={!terms && signed} />
      <RequestModal RequestExit={RequestExit} />

      <div id="mobile-banner">
        <div className="d-flex justify-content-between">
          <h1 className="title m-0 fs-3">MY VALIDATORS</h1>
          <div className="d-none d-lg-block">
            <div className="d-flex align-items-center">
              {/* Select Subscribers */}
              {selectedS.length > 0 && 
              <>
              <button 
                type="button" 
                className="btn btn-secondary fs-3"
                onClick={() => Cancel()}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-dark fs-3 ms-4"
                data-bs-toggle="modal" data-bs-target="#exampleModal">
                Subscribe {selectedS.length} validators
              </button>
              </>
              }
              
              {/* Select Exits */}
              {selectedE.length > 0 && 
              <>
              <button 
                type="button" 
                className="btn btn-secondary fs-3"
                onClick={() => Cancel()}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-dark fs-3 ms-4"
                data-bs-toggle="modal" data-bs-target="#requestModal">
                Request Exit for {selectedE.length} validators</button>
              </>
              }
              
              {/* Rebalance period */}
              {(selectedS.length + selectedE.length) == 0 &&
              <>
              <img src="img/date.svg" className="icon"/>
              <p className="m-0 fs-4 secondary"><b>{time()}</b> left in the current rewards cycle</p>
              </>
              }
            </div>
          </div>
        </div>
        {/*<p className="m-0 d-block d-lg-none fs-4 secondary">Tap to see available actions</p>*/}
      </div>
      {/*<p className="m-0 d-none d-lg-block fs-4 secondary">Hover to see available actions</p>*/}

      <div>
      <div className="d-flex justify-content-center mt-5 mb-3 table-responsive">
        <SelectContext.Provider value={{selectedS, selectedE, setSelectedS, setSelectedE}}>
          <Table 
            validators={validators ? validators : []} 
            WithdrawBond={WithdrawBond}
            exits={exits}
            AddBond={AddBond}
          />
        </SelectContext.Provider>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between" id="banner-bt">
        <div className="d-flex" id="status-info">
          <div className="d-flex align-items-center p-3">
            <img src="img/Unregistered.svg" className="icon"/>
            <p className="m-0 fs-5 secondary">Unregistered</p>
          </div>
          <div className="d-flex align-items-center p-3">
            <img src="img/Pending.svg" className="icon"/>
            <p className="m-0 fs-5 secondary">Pending</p>
          </div>
          <div className="d-flex align-items-center p-3">
            <img src="img/Active.svg" className="icon"/>
            <p className="m-0 fs-5 secondary">Active</p>
          </div>
          <div className="d-flex align-items-center p-3">
            <img src="img/Exit Requested.svg" className="icon"/>
            <p className="m-0 fs-5 secondary">Exit requested</p>
          </div>
          <div className="d-flex align-items-center p-3">
            <img src="img/Exited.svg" className="icon"/>          
            <p className="m-0 fs-5 secondary">Exited</p>
          </div>
        </div>

        <div 
          className="d-flex align-items-center" id="claim-btn" 
          onClick={() => Claim()}>
          <h1>Claim {Rewards()}</h1>
          <img src="img/Ethereum.svg"/>
        </div>
      </div>

      <div className="d-block d-lg-none">
        <div className="d-flex align-items-center justify-content-center">
          <img src="img/date.svg" className="icon"/>
          <p className="m-0 fs-5 secondary"><b>{time()}</b> to next rebalancing</p>
        </div>
      </div>

      </div> 
    </div>
  );
}


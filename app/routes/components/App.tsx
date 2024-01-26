import React, { createContext, useState, useEffect } from 'react';
import { Table } from "./Table";
import { Modal, SessionTerms, RequestModal } from "./disclaimer";
import { NETWORK } from "../utils";
import { watchAccount } from '@wagmi/core'
import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { BaseError, ContractFunctionRevertedError } from 'viem';
import { getTimeRemaining, formatEthAmount, claimed } from '../utils';
import { useLoaderData } from "@remix-run/react";
import { Loader } from "./Loader";
import { Alert } from "./Alert";
import { EventWatch } from "./EventWatch";

export const SelectContext = createContext();

export const App = (props: {validators, withdrawals, exits, signed, terms, adapter}) => {
  const client = usePublicClient();
  const { address, status } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [eventWatcherLoaded, setEventWatcherLoaded] = useState(false);
  const [validators, setValidators] = useState(props.validators);
  const [withdrawals, setWithdrawals] = useState();
  const [exits, setExits] = useState(props.exits);
  const [days, setDays] = useState();
  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [selectedS, setSelectedS] = useState([]);
  const [selectedE, setSelectedE] = useState([]);
  const [alert, setAlert] = useState();
  const [hash, setHash] = useState();

  useEffect(() => {
    const logout = async () => {
      if(days && signed) {
        await props.adapter.signOut();;
      }
    }
    logout();
  }, [address]);

  useEffect(() => {
    const load = async () => {
      const d = await getTimeRemaining(client);
      setDays(d.days);
      setHours(d.hours);
      setMinutes(d.minutes);

      if(props.withdrawals && props.withdrawals.proof.length > 0) {
        const rewards = await claimed(client, {
          functionName: 'withdrawRewards',
          args: [
            props.withdrawals.proof[0], 
            props.withdrawals.proof[1], 
            props.withdrawals.proof[2].hex
          ],
          account: address
        })

        rewards 
          ? setWithdrawals({ proof: [] }) 
          : setWithdrawals(props.withdrawals);
      }

      if(exits && exits.proof.length > 0) {
        const stake = await claimed(client, {
          functionName: 'withdrawStake',
          args: [
            exits.proof[0], 
            exits.proof[1], 
            exits.proof[2].hex
          ],
          account: address
        })
        
        stake 
          ? setExits({ proof: [] }) 
          : setExits(props.exits);
      }

      // Update Validator state from logs
      /* TODO: Need to rethink this
      if(days && !eventWatcherLoaded) {
        EventWatch(client, {validators, setValidators});
        setEventWatcherLoaded(true);
      }*/
    }
    load();
  }, [days]);

  const time = () => {
    if(days > 0) {
     return `${days} days`; 
    } else if (hours > 0) {
     return `${hours} hours`; 
    } else if (minutes > 0) {
     return `${minutes} minutes`; 
    }
    return '0 days';
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
    let alertMessage = "Successfully Subscribed Validators"
    let userRejected = false;
    let reverted = false;
    setHash(true);
    try {
      // Validate
      const req = await fetch('/registerValidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: selectedS, address }),
      });
      const { ok , data } = await req.json();
      if(ok) {
        for(let id of data) {
          if(id.status != 'ok') {
            throw new Error(`Invalid Validator ${id.index} is ${id.status}`);
          }
        }
      }

      // Write 
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'registerBulk',
        account: address, 
        args: [selectedS],
        value: NETWORK.stakeFee * BigInt(selectedS.length),
      });

      // Wait
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if(err.message.includes('Invalid Validator')) {
        reverted = true;
        alertMessage = err.message;
      }
      if(err.message.includes('insufficient funds')) {
        reverted = true;
        alertMessage = "Account has insufficient funds";
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'NotEnoughEth') {
            alertMessage = 'Error: Not Enough Eth send';
          } else {
            alertMessage = `Error: ${errorName}`
          }
          reverted = true;
        }
      } 
      console.log(err);
    } finally {
      setHash(false);
      if(!userRejected) {
        if(!reverted) {
          const req = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ indexes: selectedS, address }),
          });
          const res = await req.json();
          if(res.ok) {
            setValidators(res.data);
          }
        }
        setSelectedS([]);
        setAlert(alertMessage); 
      }
    }
  }

  const Claim = async () => {
    if(withdrawals.proof.length == 0) { return 0; }
    let alertMessage = "Successfully Claimed Rewards"
    let userRejected = false;
    let reverted = false;
    setHash(true);
    try {
      const { request } = await client.simulateContract({
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

      // Write 
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'AlreadyClaimed') {
            alertMessage = 'Error: Rewards already claimed';
          } else if(errorName == 'InvalidProof') {
            alertMessage = 'Error: Invalid Proof';
          } else {
            alertMessage = `Error: ${errorName}`
          }
          reverted = true;
        }
      }   
    } finally {
      // Update state
      setHash(false);
      if(!userRejected) {
        if(!reverted) {
          const req = await fetch('/claim', { method: 'POST' });
          const res = await req.json();
          if(res.ok) {
            setValidators(res.data);
            setWithdrawals({ proof: [] });
          }
        }
        setAlert(alertMessage); 
      }
    }
  }

  const RequestExit = async () => {
    let alertMessage = 'Successfully Requested Exit';
    let userRejected = false;
    let reverted = false;
    setHash(true);
    try {
      // Write 
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'requestExit',
        account: address, 
        args: [selectedE]
      });

      // Write 
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          alertMessage = `Error: ${errorName}`
          reverted = true;
        }
      } 
    } finally {
      // Reset
      setHash(false);
      if(!userRejected) {
        if(!reverted) {
          const req = await fetch('/exits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ indexes: selectedE }),
          });
          const res = await req.json();

          if(res.ok) {
            setValidators(res.data);
          }
        }
        setSelectedE([]);
        setAlert(alertMessage);
      }
    }
  }

  const WithdrawBond = async () => {
    if(exits.proof.length == 0) { return 0; }
    let alertMessage = 'Successfully Withdrawn Bond';
    let userRejected = false;
    let reverted = false;
    setHash(true);
    try {
      // Write 
      const { request } = await client.simulateContract({
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
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }

      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'AlreadyClaimed') {
            alertMessage = 'Error: Bond already claimed';
          } else if(errorName == 'InvalidProof') {
            alertMessage = 'Error: Invalid Proof';
          } else {
            alertMessage = `Error: ${errorName}`
          }
          reverted = true;
        }
      }     
    } finally {
      setHash(false);
      if(!userRejected) {
        if(!reverted) {
          const req = await fetch('/withdrawBond', { method: 'POST' });
          const res = await req.json();
          if(res.ok) {
            setValidators(res.data);
            setWithdrawals({ proof: [] });
          }
        }
        setAlert(alertMessage);
      }
    }
  }

  const AddBond = async (validator) => {
    let alertMessage = 'Successfully Added Bond';
    let userRejected = false;
    let reverted = false;
    setHash(true);
    try {
      const max = NETWORK.stakeFee;
      if(validator.stake.hex >= max) { throw new Error('Bond is already reached') };
      // Write 
      const { request } = await client.simulateContract({
        address: NETWORK.poolAddress,
        abi: NETWORK.poolAbi,
        functionName: 'addStake',
        account: address, 
        args: [validator.index],
        value: NETWORK.missFee,
      });

      // Wait
      const hash = await walletClient.writeContract(request);
      const reciept = await client.waitForTransactionReceipt({ hash });
    } catch(err: any) {
      if(err.message.includes('User rejected the request')) {
        userRejected = true;
      }
      if(err.message.includes('Bond is already reached')) {
        reverted = true;
        alertMessage = err.message;
      }
      if(err.message.includes('insufficient funds')) {
        reverted = true;
        alertMessage = "Account has insufficient funds";
      }
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          if(errorName == 'ZeroAmount') {
            alertMessage = "Error: Eth amount can't be 0";
          } else if(errorName == 'AmountTooBig') {
            alertMessage = 'Error: Amount to add is too big';
          } else {
            alertMessage = `Error: ${errorName}`
          }
          reverted = true;
        }
      }
    } finally {
      setHash(false);
      if(!userRejected) {
        if(!reverted) {
          const req = await fetch('/addbond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index: validator.index }),
          });
          const res = await req.json();
          if(res.ok) {
            setValidators(res.data);
          }
        }
        setAlert(alertMessage);
      }
    }
  }

  useEffect(() => {
    if(status == 'disconnected') {
      //setValidators([]); 
    } else if(status == 'connected') {
      //setValidators(props.validators); 
    }
  }, [status]);

  return(
    <div className="container-fluid d-flex flex-column pt-5 pb-3">

      {/* Modals */}
      <Modal selected={selectedS} Subscribe={Subscribe}/> 
      <Loader hash={hash}/>
      <Alert text={alert} setText={setAlert}/>
      <SessionTerms show={!props.terms && props.signed} />
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
          <img width="40px" src="img/Smoothly.svg"/>
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


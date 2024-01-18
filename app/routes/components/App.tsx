import React, { createContext, useState, useEffect } from 'react';
import { Table } from "./Table";
import { Modal, SessionTerms } from "./disclaimer";
import { NETWORK, useContract } from "../utils";
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { getTimeRemaining, formatEthAmount } from '../utils';
import { useLoaderData } from "@remix-run/react";
import { Loader } from "./Loader";
import { Alert } from "./Alert";

export const SelectContext = createContext();

export const App = (props: {validators: [], withdrawals: {}, exits: {}}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { pool, terms, signed } = useLoaderData<typeof loader>();
  const [validators, setValidators] = useState(props.validators);
  const [withdrawals, setWithdrawals] = useState(props.withdrawals);
  const [exits, setExits] = useState(props.exits);
  const [days, setDays] = useState();
  const [hours, setHours] = useState();
  const [minutes, setMinutes] = useState();
  const [selectedS, setSelectedS] = useState([]);
  const [selectedE, setSelectedE] = useState([]);
  const [alertPop, setAlertPop] = useState(false);
  let loader, alertModal;

  const load = async () => {
    if(typeof window == 'undefined') return;
    const d = await getTimeRemaining();
    setDays(d.days);
    setHours(d.hours);
    setMinutes(d.minutes);

    alertModal = new window.bootstrap.Modal("#alertModal");
    loader = new window.bootstrap.Modal(
      "#loaderModal", 
      {keyboard: false, backdrop: 'static' }
    );
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
      const contract = useContract(walletClient);
      loading(true);
      const tx = await contract.registerBulk(
        selectedS, 
        { value: NETWORK.stakeFee * BigInt(selectedS.length) }
      );

      //await tx.wait();

      const req = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: selectedS }),
      });
      const res = await req.json();

      if(res.ok) {
        setValidators(res.data);
      }

      loading(false);
      setSelectedS([]);
      popAlert("Successfully Subscribed Validators");
    } catch(err: any) {
      loading(false);
      if(!err.message.includes('User rejected the request')) {
        popAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const Claim = async () => {
    try {
      const contract = useContract(walletClient);
      loading(true);
      const tx = await contract.withdrawRewards(
        withdrawals.proof[0], 
        withdrawals.proof[1], 
        withdrawals.proof[2].hex
      );

      //await tx.wait();
      
      await fetch('/claim', { method: 'POST' });
      setWithdrawals({ proof: [] });

      loading(false);
      popAlert("Successfully Claimed Rewards");
    } catch(err: any) {
      loading(false);
      if(!err.message.includes('User rejected the request')) {
        popAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const RequestExit = async () => {
    try {
      const contract = useContract(walletClient);
      loading(true);
      const tx = await contract.requestExit(selectedE);

      //await tx.wait();

      const req = await fetch('/exits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexes: selectedE }),
      });
      const res = await req.json();

      if(res.ok) {
        setValidators(res.data);
      }

      loading(false);
      setSelectedE([]);
      popAlert("Successfully Requested Exit");
    } catch(err: any) {
      loading(false);
      if(!err.message.includes('User rejected the request')) {
        popAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const WithdrawBond = async () => {
    try {
      const contract = useContract(walletClient);
      loading(true);
      const tx = await contract.withdrawStake(
        exits.proof[0], 
        exits.proof[1], 
        exits.proof[2].hex
      );

      //await tx.wait();
      
      const req = await fetch('/withdrawBond', { method: 'POST' });
      const res = await req.json();
      if(res.ok) {
        setValidators(res.data);
        setWithdrawals({ proof: [] });
      }

      loading(false);
      popAlert("Successfully Witdhraw Bonds");
    } catch(err: any) {
      loading(false);
      if(!err.message.includes('User rejected the request')) {
        popAlert("Error: transaction reverted");
      }
      console.log(err)
    }
  }

  const popAlert = (text) => {
    const h1 = document.querySelector('#alert-text');
    h1.innerText = text;
    if(!alertModal._ishown) {
      alertModal.toggle();  
    }
  }

  const loading = (l) => {
    if(l) {
      loader.show();
    } else {
      loader.hide();
    }
  }

  useEffect(() => {
    const loadSessionTerms = () => {
      let sessionTerms = new window.bootstrap.Modal(
        "#sessionModal", 
        {keyboard: false}
      );
      if(days && signed) { // Use days to not re-render modal
        terms ? sessionTerms.hide() : sessionTerms.toggle();
      }
    }

    loadSessionTerms()
  }, [days]);

  return(
    <div className="container-fluid d-flex flex-column pt-5 pb-3">

      {/* Modals */}
      <Modal selected={selectedS} Subscribe={Subscribe}/> 
      <Loader />
      <Alert />
      <SessionTerms />

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
                onClick={() => RequestExit()}>
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


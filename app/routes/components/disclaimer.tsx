import { NETWORK, formatEthAmount } from "../utils";
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const copyText = async (e: any) => {
  try {
    await navigator.clipboard.writeText(NETWORK.poolAddress);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export const Modal = (props: {selected: number[], Subscribe: any}) => {
  const { address } = useAccount();
  const [poolAddress, setPoolAddress] = useState(NETWORK.poolAddress);

  const execute = async () => {
    const disclaimer1 = window.document.getElementById("disclaimer1").checked;
    const disclaimer2 = window.document.getElementById("disclaimer2").checked;
    const disclaimer3 = window.document.getElementById("disclaimer3").checked;
    if(disclaimer1 && disclaimer2 && disclaimer3) {
      props.Subscribe(); 
      let modal = document.querySelector('#exampleModal');
      let btn = window.bootstrap.Modal.getOrCreateInstance(modal);
      btn.hide();

    }
  }

  useEffect(() => {
    if (window.screen.width <= 600) {
      let s = String(NETWORK.poolAddress); 
      setPoolAddress(`${s.slice(0,6)}...${s.slice(38,42)}`);
    }
  },[]);

  return(
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">

          <div id="disclaimer-header" className="modal-header align-items-start p-5 pb-0">
            <div id="exampleModalLabel">
              <div className="d-flex align-items-center"> 
                <img className="me-2" width="40px" src="img/disclaimer.svg"/>
                <h1 className="modal-title fs-2">Disclaimer</h1>
              </div>
            </div>

            <button type="button" className="btn btn-secondary fs-5 align-top lato" data-bs-dismiss="modal" aria-label="Close">X</button>
          </div>

          <div className="modal-body p-2">
            <p className="disclaimer fs-5 ps-5 mt-2">Please read and check all statements before subscribing:</p>
            <div className="d-flex flex-wrap justify-content-center align-items-center">
              {props.selected.map((index: any, key: string) => (
                <div key={key} className="d-flex justify-content-center align-items-center subscriber-box p-2 m-2 fs-4"> 
                  {index}
                </div>
              ))}
            </div>
            <div id="disclaimer-boxes" className="p-5 pt-0">
              <div className="d-flex p-2 disclaimer-check">
                <input className="me-2" type="checkbox" id="disclaimer1" name="disclaimer1"/>
                <label className="lato fs-5" htmlFor="disclaimer1">I’ve read the Smoothly <a href="https://docs.smoothly.money" target="_blank">documentation</a>, <a href="https://docs.smoothly.money/terms-of-service" target="_blank">Terms of Service</a> and understand how the pool functions</label>
              </div>
              <div className="d-flex p-2 disclaimer-check">
                <input className="me-2" type="checkbox" id="disclaimer2" name="disclaimer2"/>
                <label className="lato fs-5" htmlFor="disclaimer2">I know that running MEV Boost and subscribing to one or more of the <a href="https://docs.smoothly.money/relay-monitoring" target="_blank">monitored relays</a> is required</label>
              </div>
              <div id="fee-recipient-box" className="d-flex flex-wrap p-2 disclaimer-check">
                <div className="d-flex">
                  <input className="me-2" type="checkbox" id="disclaimer3" name="disclaimer3"/>
                  <label className="lato fs-5" htmlFor="disclaimer3">I’ve verified the fee recipient in my validator client is: &nbsp; </label>
                </div>
                <>
                <span className="d-flex align-items-center" onClick={(e: any) => copyText(e)} id="fee-recipient">{poolAddress} {copyBtn()}</span>
                </>
              </div>
            </div>
          </div>

          <div className="modal-footer p-5 pt-0"> 
            <button 
              type="button" 
              className="btn btn-dark fs-5 m-0 lato"
              onClick={(e: any) => execute(e)}>
              Deposit {formatEthAmount((Number(NETWORK.stakeFee) * props.selected.length).toString())} ETH and subscribe {props.selected.length} validators</button>
          </div>

        </div>
      </div>
    </div>

  );
}


const copyBtn = () => {
  return (
  <svg onClick={(e: any) => copyText(e)} width="20" height="20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0319 0.0012548H19.8893C21.0023 0.0012548 22.0137 0.455481 22.7464 1.18827C23.478 1.92105 23.9335 2.93239 23.9335 4.04537V12.9028C23.9335 14.0158 23.478 15.0271 22.7464 15.7586C22.0137 16.4914 21.0023 16.9456 19.8893 16.9456H15.1739V21.8417C15.1739 23.5783 13.7523 25 12.0157 25H3.15825C1.42165 25 0 23.5796 0 21.8417V12.9843C0 11.2477 1.42165 9.82609 3.15825 9.82609H6.9878V4.04412C6.9878 2.93114 7.44329 1.9198 8.17482 1.18701C8.90635 0.454226 9.91769 0 11.0307 0L11.0319 0.0012548ZM19.8893 1.77299H11.0319C10.4083 1.77299 9.83989 2.02896 9.42833 2.44052C9.01551 2.85209 8.75954 3.4205 8.75954 4.04412V12.9015C8.75954 13.5251 9.01551 14.0936 9.42833 14.5051C9.83989 14.9167 10.4083 15.1727 11.0319 15.1727H19.8893C20.513 15.1727 21.0814 14.9167 21.4929 14.5051C21.9045 14.0936 22.1605 13.5251 22.1605 12.9015V4.04412C22.1605 3.4205 21.9045 2.85209 21.4929 2.44052C21.0814 2.02896 20.513 1.77299 19.8893 1.77299Z" fill="white"/>
    </svg>
  );
}

export const SessionTerms = (props: {show: boolean}) => {

  useEffect(() => {
    let modal = document.querySelector('#sessionModal');
    let session = window.bootstrap.Modal.getOrCreateInstance(modal);
    
    if(props.show) {
      session.show();
    }

  }, [props.show]);

  return(
    <div className="modal fade" id="sessionModal" tabIndex="-1" aria-labelledby="sessionModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">

          <div className="modal-header align-items-start p-5 pb-0">
            <div id="sessionModalLabel">
              <div className="d-flex align-items-center"> 
                <img className="me-2" width="40px" src="img/disclaimer.svg"/>
                <h1 className="modal-title fs-2">Notice</h1>
              </div>
            </div>

            <button type="button" className="btn btn-secondary fs-5 align-top lato" data-bs-dismiss="modal" aria-label="Close">X</button>
          </div>

          <div className="modal-body p-2">
            <div id="session-content" className="p-5 pt-0">
              <h1 className="fs-2 p-4">Oracle Operators Listen to Finalized Epochs </h1>
              <ul >
                <li className="fs-5">Transactions will update immediately on the dashboard, but will not finalize for ~12 min.</li>
                <li className="fs-5">If you disconnect and reconnect your wallet, you may not immediately see your last transaction.</li>
                <li className="fs-5">Avoid submitting duplicate transactions to prevent a loss of funds.</li>
                <li className="fs-5">If you're unsure about a transaction, wait 15 min or check the hash on etherscan.</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer p-5 pt-0"> 
              <p className="disclaimer fs-5 mt-2">
              For more details, please visit our <a href="https://docs.smoothly.money" target="_blank">
              documentation</a>
              </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export const RequestModal = (props: { RequestExit: any }) => {
  return(
    <div className="modal fade" id="requestModal" tabIndex="-1" aria-labelledby="requestModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">

          <div className="modal-header align-items-start p-5 pb-0">
            <div id="requestModalLabel">
              <div className="d-flex align-items-center"> 
                <img className="me-2" width="40px" src="img/disclaimer.svg"/>
                <h1 className="modal-title fs-2">Notice</h1>
              </div>
            </div>

            <button type="button" className="btn btn-secondary fs-5 align-top lato" data-bs-dismiss="modal" aria-label="Close">X</button>
          </div>

          <div className="modal-body p-2">
            <div id="exitModal" className="p-5">
              <ul >
                <li className="fs-5">Requesting an exit for a Pending validator will result in its accrued rewards being added to the pool!</li>
                <li className="fs-5">If your validator is Active, your accrued rewards will remain claimable</li>
              </ul>
            </div>
          </div>

          <div id="exit-modal-footer" className="modal-footer p-5 pt-0 d-flex justify-content-between"> 
              <p className="disclaimer fs-5 mt-2">
              For more details, please visit our <a href="https://docs.smoothly.money" target="_blank">
              documentation</a>
              </p>
            <button 
              type="button" 
              className="btn btn-dark fs-5 m-0 lato"
              data-bs-dismiss="modal"
              onClick={() => props.RequestExit()}>
              Request Exit</button>
          </div>

        </div>
      </div>
    </div>
  );
}

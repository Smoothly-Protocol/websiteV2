import { FixedNumber } from "ethers";
import { 
  formatEthAmount,
  status,
  state,
  NETWORK, 
  tooltip1,
  tooltip2
} from '../utils';
import { useWalletClient } from 'wagmi';
import React, { useState, useContext, useEffect } from 'react';
import { SelectContext } from './App';

export const Table = (props: {
  validators: any, 
  WithdrawBond: any, 
  exits: any,
  AddBond: any
  }) => {
  const Validators = props.validators;
  const { 
    selectedS, selectedE, 
    setSelectedS, setSelectedE
  } = useContext(SelectContext);

  
  useEffect(() => {
    const loadToolTips = () => {
      const tooltipTriggerList = window.document.querySelectorAll('[data-bs-toggle="tooltip"]')
      const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    loadToolTips();
  }, [selectedE, selectedS, Validators]);

  if(Validators.length > 0) {
  return(
    <table className="table align-middle table-borderless">
      <thead>
        <tr>
          <th scope="col"> </th>
          <th className="t-head" scope="col">INDEX</th>
          <th className="t-head" scope="col">
            BOND
            <img 
              src="img/ethereum.svg" 
              alt="Ethereum Logo" 
              className="icon m-0"
            />
          </th>
          <th className="t-head" scope="col">
            UNCLAIMED
            <img 
              src="img/ethereum.svg" 
              alt="Ethereum Logo" 
              className="icon m-0"
            />
          </th>
          <th scope="col"> </th>
        </tr>
      </thead>
      <tbody>
        {Validators.map((validator: any, key: string) => (
          <tr className="fs-4" key={key}>
            <th scope="row">
              <img 
                src={`img/${status(validator)}.svg`}
                alt={`${status(validator)}`} 
                className="icon"
              />
            </th>
            <td>
              <div className="t-container-1">
                <span className="ft-number">{validator.index}</span>
              </div>
            </td>
            <td>
              <Action2 
                validator={validator} 
                WithdrawBond={props.WithdrawBond}
                exits={props.exits}
                AddBond={props.AddBond}/>
            </td>
            <td> 
              <Action3 validator={validator} />
            </td>
            <td className="no-white-space">
            {state(validator) == "Good" ? (
              <div 
                className="info-1" 
                data-bs-toggle="tooltip" 
                data-bs-placement="top"
                data-bs-title={tooltip1(validator)}>
                <span className="ft-text">?</span>
              </div>
            ) : (
              <div 
                className="info-2" 
                data-bs-toggle="tooltip" 
                data-bs-placement="top"
                data-bs-title={tooltip2(validator)}>
                <span className="ft-text">!</span>
              </div>
            )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  } else {
    return (
      <div className="d-flex align-self-center justify-content-center">
        <h1> No validators found </h1>
      </div>
    )
  }
}

const Action2 = (props: {
  validator: any, 
  WithdrawBond: any, 
  exits: any,
  AddBond: any
  }) => {
  const penalized = state(props.validator);
  const st = status(props.validator);
  const index = props.validator.index;
  const { data: walletClient } = useWalletClient();
  const stake = props.validator.stake 
    ? formatEthAmount(props.validator.stake.hex) 
    : "0.00"; 

  let fee = FixedNumber.fromValue(NETWORK.stakeFee); 
  let fixedStake = props.validator.stake 
    ? FixedNumber.fromValue(props.validator.stake.hex) 
    : null; 

  if(props.exits.proof.length > 0 && props.exits.proof[1].includes(props.validator.index)) {
    return(
      <div 
        className="t-container-2 purple-btn-hover"
        onMouseEnter={(e: any) => {changeTextOver(e, "purple", `Withdraw bond >`)}}
        onMouseLeave={(e: any) => {changeTextOut(e, "purple", stake)}}
        onClick={() => props.WithdrawBond()}
      >
        <span className="ft-number">
         {stake}
        </span>
      </div>
    )
  }

  if(fixedStake && fee.gt(fixedStake) && props.validator.active) {
      let needs = formatEthAmount(NETWORK.missFee);
      return (
        <div 
          className="t-container-2 purple-btn-hover"
          onMouseEnter={(e: any) => {changeTextOver(e, "purple", `Add ${needs} bond >`)}}
          onMouseLeave={(e: any) => {changeTextOut(e, "purple", stake)}}
          onClick={() => props.AddBond(index)}
        >
          <span className="ft-number">
           {stake}
          </span>
        </div>
      )
  } else{
    return(
      <div className="t-container-2">
        <span className="ft-number">
          {stake}
        </span>
      </div>
    )
  }
};

const Action3 = (props: {validator: any}) => {
  const state = status(props.validator);
  const rewards = props.validator.rewards ? formatEthAmount(props.validator.rewards.hex) : "0.00";
  const { setSelectedS, selectedS, selectedE, setSelectedE } = useContext(SelectContext);
  const index = props.validator.index;

  const updateSelectionS = () => {
    setSelectedE([]); //Reset
    selectedS.includes(index) 
      ? setSelectedS(selectedS.filter(e => e !== index)) // Remove 
      : setSelectedS([...selectedS, index]); // Push
  }

  const updateSelectionE = () => {
    setSelectedS([]); // Reset
    selectedE.includes(index) 
      ? setSelectedE(selectedE.filter(e => e !== index)) // Remove 
      : setSelectedE([...selectedE, index]); // Push
  }

  switch(state) {
    case 'Unregistered': {
      const isSelected = selectedS.includes(index);
      return (
        <div className={`t-container-3 ${isSelected ? "grey-btn" : "purple-btn"}`} 
          onClick={() => updateSelectionS()}>
          <span className="ft-text">
           { isSelected ? "Selected" : 'Subscribe >'}
          </span>
        </div>
      )
    }
    case 'Active': {
      const isSelected = selectedE.includes(index);
      return (
        <div 
          className={`t-container-3 ${isSelected ? "grey-btn" : "purple-btn-hover"}`}
          onMouseEnter={(e: any) => {changeTextOver(e, "purple", `${isSelected ? "Selected" : "Request Exit >"}`)}}
          onMouseLeave={(e: any) => {changeTextOut(e, "purple", rewards)}}
          onClick={() => updateSelectionE()}
        >
          <span className="ft-number">
           { isSelected ? "Selected" : rewards}
          </span>
        </div>
      )
    
    }
    case 'Pending': {
      const isSelected = selectedE.includes(index);
      return (
        <div 
          className={`t-container-3 ${isSelected ? "grey-btn" : "purple-btn-hover"}`}
          onMouseEnter={(e: any) => {changeTextOver(e, "purple", `${isSelected ? "Selected" : "Request Exit >"}`)}}
          onMouseLeave={(e: any) => {changeTextOut(e, "purple", rewards)}}
          onClick={() => updateSelectionE()}
        >
          <span className="ft-number">
           { isSelected ? "Selected" : rewards}
          </span>
        </div>
      )
    
    }
    case 'Exit Requested': {
        {/*<div 
          className="t-container-3 grey-btn-hover" 
          onMouseEnter={(e:any) => {changeTextOver(e, "grey", "Exit Requested")}}
          onMouseLeave={(e:any) => {changeTextOut(e, "grey", rewards)}}
        >*/}
      return (
        <div className="t-container-3">
          <span className="ft-number">
            {rewards}
          </span>
        </div>
      )
    
    }
    default: {
      return (
        <div className="t-container-3 ">
          <span className="ft-number">
            {rewards}
          </span>
        </div>
      )
    }  
  }
}

// Style Changers
const changeTextOver = (x: any, color: string, text: string) => {
  x.target.classList.remove(`${color}-btn-hover`);
  x.target.classList.add(`${color}-btn`);
  x.target.innerHTML = `
    <span class="ft-text">
      ${text}
    </span>
  `;
} 

const changeTextOut = (x: any, color: string, text: string) => {
  x.target.classList.remove(`${color}-btn`);
  x.target.classList.add(`${color}-btn-hover`);
  x.target.innerHTML = `
    <span class="ft-number">
      ${text}
    </span>
  `;
} 

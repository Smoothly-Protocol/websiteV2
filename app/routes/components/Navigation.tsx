import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useLoaderData } from "@remix-run/react";
import { usePublicClient } from 'wagmi';

export const Header = () => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => { 
    if(typeof window == 'undefined') return;
    const width = window.screen.width;
    width > 991 ? setMobile(false) : setMobile(true);
    
    const handleResize = () => {
      // Perform actions on window resize
      const width = window.screen.width;
      width > 991 ? setMobile(false) : setMobile(true);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-transparent">
        <div className="container-fluid" >
          <a id="logo"className="navbar-brand" href="#">
            <img 
              src="img/Smoothly.svg" 
              alt="Logo" 
              className="d-inline-block align-middle"
              />
             <span className="align-middle">Smoothly</span>
          </a>

          { mobile &&
            <div className="align-right">
              <ConnectButton chainStatus="name"/>
            </div>
          }

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse " id="navbarNav">
            <ul className="navbar-nav align-middle fs-4">
              <li className="link nav-item">
                <a className="nav-link" href="https://docs.smoothly.money/how-to-guide" target="_blank">Get Started</a>
              </li>
              <li className="link nav-item">
                <a className="nav-link" href="https://docs.smoothly.money" target="_blank">Docs</a>
              </li>
              <li className="link nav-item">
                <a className="nav-link" href="https://smoothly.money/#donate" target="_blank">Donate</a>
              </li>
            </ul>
          </div>

          { !mobile &&
            <div className="align-right">
              <ConnectButton chainStatus="name"/>
            </div>
          }

        </div>
      </nav>
    </>
  );
}

export const Footer = (props: {pool: Object}) => {
  const [mobile, setMobile] = useState(false);
  const [gas, setGas] = useState(38.51);
  const provider = usePublicClient();

  useEffect(() => {
    const loadGas = async () => {
      const gasPrice = await provider.getGasPrice(); // wei
      const gwei = parseFloat(Number(gasPrice) * 10 ** -9).toFixed(2);
      setGas(gwei);
    } 
    loadGas()
  },[gas]);

  useEffect(() => { 
    if(typeof window == 'undefined') return;
    const width = window.screen.width;
    width > 991 ? setMobile(false) : setMobile(true);

    const handleResize = () => {
      // Perform actions on window resize
      const width = window.screen.width;
      width > 991 ? setMobile(false) : setMobile(true);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <footer className="navbar pt-5 ">
      <div className="container-fluid p-0 justify-content-between" id="footer">

        <div>
          <ul className="navbar-nav d-flex flex-row">
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/user.svg" 
                alt="Subscriber" 
                className="icon"
                />
               <span className="fs-4">{props.pool.awaiting_activation + props.pool.activated} {!mobile && 'subscribers'}</span>
            </li>
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/ethereum.svg" 
                alt="Ethereum Logo" 
                className="icon"
                />
               <span className="fs-4">0.11 {!mobile && 'avg reward'}</span>
            </li>
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/fire.svg" 
                alt="Gas" 
                className="icon"
                />
               <span className="fs-4">{gas} {!mobile && 'gwei'}</span>
            </li>
          </ul> 
        </div>

        <div>
          <ul className="navbar-nav d-flex flex-row justify-content-end">
            <li className="link fs-4">
              <a className="nav-link" href="https://discord.com/invite/WvcEAcg9Aj" target="_blank">Discord</a>
            </li>
            <li className="link nav-item fs-4">
              <a className="nav-link" href="https://github.com/Smoothly-Protocol" target="_blank">Github</a>
            </li>
            <li className="link nav-item fs-4">
              <a className="nav-link" href="https://warpcast.com/kodys.eth" target="_blank">Farcaster</a>
            </li>
          </ul> 
        </div>

      </div>
    </footer>
  );
}

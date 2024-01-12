import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export const Header = () => {
  const [mobile, setMobile] = useState(false);

  useEffect(() => { 
    if(typeof window == 'undefined') return;
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
              src="img/logo.svg" 
              alt="Logo" 
              className="d-inline-block align-middle"
              />
             <span className="align-middle">Smoothly</span>
          </a>

          { mobile &&
            <div className="align-right">
              <ConnectButton chainStatus="none"/>
            </div>
          }

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav align-middle fs-4">
              <li className="link nav-item">
                <a className="nav-link" href="https://docs.smoothly.money/how-to-guide">Get Started</a>
              </li>
              <li className="link nav-item">
                <a className="nav-link" href="https://docs.smoothly.money">Docs</a>
              </li>
              <li className="link nav-item">
                <a className="nav-link" href="#">Donate</a>
              </li>
            </ul>
          </div>

          { !mobile &&
            <div className="align-right">
              <ConnectButton chainStatus="none"/>
            </div>
          }

        </div>
      </nav>
    </>
  );
}

export const Footer = () => {
  return (
    <footer className="navbar pt-5">
      <div className="container-fluid p-0" id="footer">

        <div>
          <ul className="navbar-nav d-flex flex-row">
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/user.svg" 
                alt="Subscriber" 
                className="icon"
                />
               <span>3798 subscribers</span>
            </li>
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/ethereum.svg" 
                alt="Ethereum Logo" 
                className="icon"
                />
               <span>0.11 avg reward</span>
            </li>
            <li className="link d-flex align-items-center fs-4">
              <img 
                src="img/fire.svg" 
                alt="Gas" 
                className="icon"
                />
               <span>38.51 gwei</span>
            </li>
          </ul> 
        </div>

        <div>
          <ul className="navbar-nav d-flex flex-row justify-content-end">
            <li className="link fs-4">
              <a className="nav-link" href="https://discord.com/invite/WvcEAcg9Aj">Discord</a>
            </li>
            <li className="link nav-item fs-4">
              <a className="nav-link" href="https://github.com/Smoothly-Protocol">Github</a>
            </li>
            <li className="link nav-item fs-4">
              <a className="nav-link" href="https://warpcast.com/kodys.eth">Farcaster</a>
            </li>
          </ul> 
        </div>

      </div>
    </footer>
  );
}
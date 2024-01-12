import { NETWORK } from "../utils";

const copyText = async (e: any) => {
  try {
    await navigator.clipboard.writeText(e.target.textContent);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export const Modal = (props: {selected: number[], Subscribe: any}) => {

  const execute = () => {
    //TODO: Verify that all boxes are checked
     props.Subscribe(); 
  }

  return(
    <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">

          <div className="modal-header align-items-start p-5 pb-0">
            <div id="exampleModalLabel">
              <div className="d-flex align-items-center"> 
                <img className="me-2" width="40px" src="img/disclaimer.svg"/>
                <h1 className="modal-title fs-2">Disclaimer</h1>
              </div>
              <p className="disclaimer fs-5 mt-2">Please read and check all statements before subscribing:</p>
            </div>

            <button type="button" className="btn btn-secondary btn-modak fs-4 align-top" data-bs-dismiss="modal" aria-label="Close"> {"< Back"}</button>
          </div>

          <div className="modal-body p-2">
            <div className="d-flex justify-content-center align-items-center">
              {props.selected.map((index: any, key: string) => (
                <div key={key} className="d-flex justify-content-center align-items-center subscriber-box p-2 m-2 fs-4"> 
                  {index}
                </div>
              ))}
            </div>
            <div className="p-5 pt-0">
              <div className="p-2 disclaimer-check">
                <input className="me-2" type="checkbox" id="disclaimer1" name="disclaimer1"/>
                <label for="disclaimer1">I’ve read the Smoothly documentation and understand how the pool functions</label>
              </div>
              <div className="p-2 disclaimer-check">
                <input className="me-2" type="checkbox" id="disclaimer2" name="disclaimer2"/>
                <label for="disclaimer2">I know that running MEV Boost and subscribing to one or more of the approved relays is required</label>
              </div>
              <div className="p-2 disclaimer-check">
                <input className="me-2" type="checkbox" id="disclaimer3" name="disclaimer3"/>
                <label for="disclaimer3">I’ve verified the fee recipient is &nbsp; </label>
                <span onClick={(e: any) => copyText(e)} id="fee-recipient">{NETWORK.poolAddress} {copyBtn()}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer p-5 pt-0"> 
            <button 
              type="button" 
              className="btn btn-dark btn-modak fs-4 m-0"
              onClick={() => execute()}>
              Subscribe {props.selected.length} validators {'>'}</button>
          </div>

        </div>
      </div>
    </div>

  );
}

const copyBtn = () => {
  return (
  <svg width="20" height="20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.0319 0.0012548H19.8893C21.0023 0.0012548 22.0137 0.455481 22.7464 1.18827C23.478 1.92105 23.9335 2.93239 23.9335 4.04537V12.9028C23.9335 14.0158 23.478 15.0271 22.7464 15.7586C22.0137 16.4914 21.0023 16.9456 19.8893 16.9456H15.1739V21.8417C15.1739 23.5783 13.7523 25 12.0157 25H3.15825C1.42165 25 0 23.5796 0 21.8417V12.9843C0 11.2477 1.42165 9.82609 3.15825 9.82609H6.9878V4.04412C6.9878 2.93114 7.44329 1.9198 8.17482 1.18701C8.90635 0.454226 9.91769 0 11.0307 0L11.0319 0.0012548ZM19.8893 1.77299H11.0319C10.4083 1.77299 9.83989 2.02896 9.42833 2.44052C9.01551 2.85209 8.75954 3.4205 8.75954 4.04412V12.9015C8.75954 13.5251 9.01551 14.0936 9.42833 14.5051C9.83989 14.9167 10.4083 15.1727 11.0319 15.1727H19.8893C20.513 15.1727 21.0814 14.9167 21.4929 14.5051C21.9045 14.0936 22.1605 13.5251 22.1605 12.9015V4.04412C22.1605 3.4205 21.9045 2.85209 21.4929 2.44052C21.0814 2.02896 20.513 1.77299 19.8893 1.77299Z" fill="white"/>
    </svg>
  );
}

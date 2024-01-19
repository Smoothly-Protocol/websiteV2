import React, { useEffect } from 'react';

export const Alert = (props:{ text: string, setText: any }) => {

  useEffect(() => {
    let modal = document.querySelector('#alertModal');
    let alert = window.bootstrap.Modal.getOrCreateInstance(modal);

    modal.addEventListener('hidden.bs.modal', function (event) {
      props.setText();
    })

    if(props.text) {
      setTimeout(() => {
        alert.show();
      }, 500);
    }   
  }, [props.text]);

  return(
      <div className="modal fade" id="alertModal" tabIndex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            <div className="modal-header align-items-start p-5 pb-0">
              <div id="alertModalLabel">
                <div className="d-flex align-items-center"> 
                  <img className="me-2" width="40px" src="img/disclaimer.svg"/>
                  <h1 className="modal-title fs-2">Alert</h1>
                </div>
              </div>

              <button type="button" className="btn btn-secondary fs-5 align-top lato" data-bs-dismiss="modal" aria-label="Close">X</button>
            </div>

            <div className="modal-body p-2">
              <div className="p-5 pt-0 d-flex justify-content-center">
                <h1 id="alert-text" className="fs-3 p-4">{props.text}</h1>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
}

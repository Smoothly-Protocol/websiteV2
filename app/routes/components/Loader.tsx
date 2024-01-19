import React, { useState, useEffect } from 'react';

export const Loader = (props: {hash}) => {

  useEffect(() => {
    let modal = document.querySelector('#loaderModal');
    let spinner = window.bootstrap.Modal.getOrCreateInstance(modal);

    if(props.hash) {
      spinner.show();
    } else if(spinner) {
      spinner.hide();
    }
  }, [props.hash]);

  return (
    <div className="modal fade align-items-center" id="loaderModal" data-bs-backdrop="static" data-bs-keyboard="false" data-bs-target="#loaderModal" tabIndex="-1" aria-labelledby="loaderModalLabel" aria-hidden="true">
      <div className="modal-dialog  modal-dialog-centered">
        <lottie-player src="img/Smoothly.json" background="transparent"  speed="1"  style={{width: "300px", height: "300px", marginLeft: "5vw"}} loop autoplay></lottie-player>
      </div>
    </div>
  );
}

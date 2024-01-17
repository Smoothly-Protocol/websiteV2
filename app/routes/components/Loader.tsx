
export const Loader = () => {
  return (
    <div className="modal fade align-items-center" id="loaderModal" data-bs-target="#loaderModal" tabIndex="-1" aria-labelledby="loaderModalLabel" aria-hidden="true">
      <div className="modal-dialog  modal-dialog-centered">
        <lottie-player src="img/Smoothly.json" background="transparent"  speed="1"  style={{width: "300px", height: "300px", marginLeft: "5vw"}} loop controls autoplay></lottie-player>
      </div>
    </div>
  );
}

// Alpha-version notice shown on every login (no localStorage suppression).
// Purely presentational — App decides when to render it and passes onClose.
function WelcomeModal({ onClose }) {
  return (
    <div
      className="welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="welcome-modal">
        <h2 id="welcome-title" className="welcome-header">
          Alpha Build v0.1.0
        </h2>
        <div className="welcome-body">
          <p className="welcome-text">
            Welcome back to Spoke. This is a testing version. The app is under
            constant construction. Help us improve by sending suggestions or
            reporting bugs in our feedback section.
          </p>
          <button className="welcome-button" onClick={onClose}>
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomeModal;

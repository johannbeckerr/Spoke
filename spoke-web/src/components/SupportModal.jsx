// Brutalist "Support the project" modal. Purely presentational — the parent
// controls visibility and passes onClose.
function SupportModal({ onClose }) {
  return (
    <div
      className="support-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-title"
    >
      <div className="support-modal">
        <div className="support-header">
          <h2 id="support-title" className="support-title">
            Support the Project
          </h2>
          <button
            className="support-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="support-body">
          <h3 className="support-headline">Fuel the Ride</h3>
          <p className="support-text">
            Spoke is an independent project. Your contribution helps keep the
            servers running and the code evolving. Help us keep the ride going.
          </p>
          <a
            className="support-button"
            href="https://buymeacoffee.com/johannbecker"
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate
          </a>
        </div>
      </div>
    </div>
  );
}

export default SupportModal;

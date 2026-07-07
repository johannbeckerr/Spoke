// One ride in the feed: route, date, type/pace badges, participants,
// and the Join/Leave button.

// Small emoji cue per ride type so cards are scannable at a glance
const TYPE_ICONS = {
  Road: '🚴',
  MTB: '🚵',
  Gravel: '🛤️',
  City: '🏙️',
};

// Turn "2026-07-10T18:30:00" into something friendly like "Fri, Jul 10 · 6:30 PM"
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const day = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${day} · ${time}`;
}

function RideCard({ ride, currentUser, onJoin, onLeave, onDelete }) {
  // currentUser is null while browsing anonymously — then nothing is "joined"
  const isJoined =
    currentUser != null &&
    ride.participants.some((person) => person.id === currentUser.id);

  // Only the creator gets the delete button
  const isCreator =
    currentUser != null && ride.creator != null && ride.creator.id === currentUser.id;

  function handleDeleteClick() {
    // A plain browser dialog is enough protection against accidental clicks
    if (window.confirm('Delete this ride for everyone? This cannot be undone.')) {
      onDelete(ride.id);
    }
  }

  return (
    <article className="ride-card">
      <div className="ride-card-top">
        <div className="ride-route">
          <span className="type-icon">{TYPE_ICONS[ride.rideType] || '🚲'}</span>
          <div>
            <div className="route-text">
              {ride.startPoint} <span className="route-arrow">→</span> {ride.destination}
            </div>
            <div className="ride-date">{formatDateTime(ride.dateTime)}</div>
          </div>
        </div>

        <div className="badges">
          {/* the CSS classes badge-road / badge-mtb / ... set the colors */}
          <span className={`badge badge-${ride.rideType.toLowerCase()}`}>{ride.rideType}</span>
          <span className={`badge badge-${ride.pace.toLowerCase()}`}>{ride.pace}</span>
        </div>
      </div>

      <div className="ride-card-bottom">
        <div className="participants">
          <span className="participants-count">
            👥 {ride.participants.length} going
          </span>
          <span className="participants-names">
            {ride.participants.map((person) => person.name).join(', ')}
          </span>
        </div>

        <div className="card-actions">
          {isCreator && (
            <button className="btn btn-delete" onClick={handleDeleteClick}>
              Delete
            </button>
          )}
          {isJoined ? (
            <button className="btn btn-leave" onClick={() => onLeave(ride.id)}>
              Leave ride
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => onJoin(ride.id)}>
              Join ride
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default RideCard;

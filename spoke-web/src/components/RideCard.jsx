// One ride in the feed: route, date, type/pace badges, participants,
// and the Join/Leave button. Details (attendees + actions) are hidden
// behind a "View Details" toggle so the collapsed card stays minimal.

import { useState } from 'react';
import { RoadIcon, MtbIcon, GravelIcon, CityIcon, BikeIcon, UsersIcon, ChevronIcon } from './icons.jsx';

// Small line-art cue per ride type so cards are scannable at a glance
const TYPE_ICONS = {
  Road: RoadIcon,
  MTB: MtbIcon,
  Gravel: GravelIcon,
  City: CityIcon,
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
  // Collapsed by default — the card only expands when the rider asks for more.
  const [showDetails, setShowDetails] = useState(false);

  function toggleDetails() {
    setShowDetails(!showDetails);
  }

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

  const TypeIcon = TYPE_ICONS[ride.rideType] || BikeIcon;

  return (
    <article className="ride-card">
      <div className="ride-card-top">
        <div className="ride-date-group">
          <span className="type-icon">
            <TypeIcon />
          </span>
          <div className="ride-date">{formatDateTime(ride.dateTime)}</div>
        </div>

        <div className="ride-meta-row">
          <div className="attendees-preview">
            <UsersIcon className="attendees-icon" />
            {ride.participants.length} going
          </div>

          <div className="badges">
            {/* the CSS classes badge-road / badge-mtb / ... set the colors */}
            <span className={`badge badge-${ride.rideType.toLowerCase()}`}>{ride.rideType}</span>
            <span className={`badge badge-${ride.pace.toLowerCase()}`}>{ride.pace}</span>
          </div>
        </div>
      </div>

      {/* Route (START/END) now lives directly below the meta row, always visible */}
      <div className="route-timeline">
        <div className="route-axis">
          <span className="route-dot route-dot-start" />
          <span className="route-line" />
          <span className="route-dot route-dot-end" />
        </div>

        <div className="route-modules">
          <div className="route-module">
            <span className="route-label">Start</span>
            <p className="route-text">{ride.startPoint}</p>
          </div>
          <div className="route-module">
            <span className="route-label">End</span>
            <p className="route-text">{ride.destination}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="toggle-details-btn"
        onClick={toggleDetails}
        aria-label={showDetails ? 'Hide details' : 'View details'}
      >
        <ChevronIcon
          style={{
            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {showDetails && (
        <div className="ride-card-bottom">
          {ride.origin_lat && ride.destination_lat && (
            <a
              className="route-link"
              href={`https://www.google.com/maps/dir/?api=1&origin=${ride.origin_lat},${ride.origin_lon}&destination=${ride.destination_lat},${ride.destination_lon}&travelmode=bicycling`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View full route
            </a>
          )}

          <div className="riders-section">
            <h3 className="riders-heading">Riders</h3>
            <div className="participant-tags">
              {ride.participants.map((person) => (
                <span key={person.id} className="participant-tag">
                  {person.name}
                </span>
              ))}
            </div>
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
      )}
    </article>
  );
}

export default RideCard;

import { useState } from 'react';
import Avatar from './Avatar.jsx';
import { bikePhotoUrl } from '../api.js';

// The mini-profile template — photo + name, the rider's own words, their
// habits derived from the rides array, and their bike. One component,
// two homes: inside the roster modal (RiderProfile), and as the page you
// see right after saving your own profile (EditProfile's view mode).
// onCreateProfile is only passed when the profile being shown belongs to
// the logged-in viewer: their empty profile then offers a "create it"
// action. Anyone else's empty profile simply shows less — name, portrait
// and ride stats — with the unset sections omitted entirely.
function ProfileView({ rider, rides, onCreateProfile }) {
  // A dead photo request hides the MY RIDE section — better than a
  // broken-image icon inside the frame
  const [bikeFailed, setBikeFailed] = useState(false);
  // The photo's URL never changes, so bust the browser cache once per
  // mount — a freshly saved photo must not lose to a cached older one
  const [cacheKey] = useState(() => Date.now());

  // Rides this rider takes part in, split the same way My Rides splits them
  const ridden = rides.filter((ride) =>
    ride.participants.some((person) => person.id === rider.id)
  );
  const created = ridden.filter((ride) => ride.creator && ride.creator.id === rider.id).length;
  const joined = ridden.length - created;

  // The rider's habits: whichever type and pace show up most in their rides
  function favorite(key) {
    const counts = {};
    for (const ride of ridden) {
      counts[ride[key]] = (counts[ride[key]] || 0) + 1;
    }
    let best = null;
    for (const value of Object.keys(counts)) {
      if (best === null || counts[value] > counts[best]) best = value;
    }
    return best;
  }
  const favoriteType = favorite('rideType');
  const favoritePace = favorite('pace');

  // Nothing filled in yet (no style, no bike photo)
  const hasCustomProfile = Boolean(rider.ridingStyle || rider.hasBikePhoto);

  return (
    <>
      {/* Centered vertical axis: name on top, portrait right below it */}
      <div className="profile-head">
        <h2 className="profile-name">{rider.name}</h2>
        <Avatar user={rider} variant="hero" />
      </div>

      {/* Only the owner gets nudged about an empty profile */}
      {!hasCustomProfile && onCreateProfile && (
        <button className="profile-cta" onClick={onCreateProfile}>
          Create your profile now
        </button>
      )}

      {rider.ridingStyle && (
        <div>
          <p className="profile-section-label">Riding style</p>
          <div className="profile-tags">
            <span className="profile-tag">{rider.ridingStyle}</span>
          </div>
        </div>
      )}

      {favoriteType && (
        <div>
          <p className="profile-section-label">Usually rides</p>
          <div className="badges">
            <span className={`badge badge-${favoriteType.toLowerCase()}`}>{favoriteType}</span>
            <span className={`badge badge-${favoritePace.toLowerCase()}`}>{favoritePace}</span>
          </div>
        </div>
      )}

      <div>
        <p className="profile-section-label">Rides with Spoke</p>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-number">{created}</span>
            <span className="profile-stat-label">Created</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat-number">{joined}</span>
            <span className="profile-stat-label">Joined</span>
          </div>
        </div>
      </div>

      {rider.hasBikePhoto && !bikeFailed && (
        <div>
          <p className="profile-section-label">My ride</p>
          <img
            className="profile-bike"
            src={`${bikePhotoUrl(rider.id)}?t=${cacheKey}`}
            alt={`${rider.name}'s bike`}
            onError={() => setBikeFailed(true)}
          />
        </div>
      )}
    </>
  );
}

export default ProfileView;

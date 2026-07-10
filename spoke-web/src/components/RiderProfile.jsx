import ProfileView from './ProfileView.jsx';

// Modal wrapper around the profile template, opened by tapping a rider
// in a card's roster. Everything shown comes from data the app already
// holds (the participant object + the rides array); only the bike photo
// loads over the network, straight into its <img>.
// When the tapped rider IS the viewer and their profile is still empty,
// the card offers "create your profile" (via onCreateProfile) instead of
// the third-person notice.
function RiderProfile({ rider, rides, currentUser, onCreateProfile, onClose }) {
  const isOwnProfile = currentUser != null && currentUser.id === rider.id;

  return (
    // Tapping the dark backdrop closes; taps inside the card must not
    <div className="profile-overlay" onClick={onClose}>
      <div
        className="profile-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Rider profile: ${rider.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <ProfileView
          rider={rider}
          rides={rides}
          onCreateProfile={isOwnProfile ? onCreateProfile : undefined}
        />
        <button className="profile-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default RiderProfile;

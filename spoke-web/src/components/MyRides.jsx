import RideFeed from './RideFeed.jsx';

// The personal dashboard, only reachable when logged in.
// Both lists are derived from the same rides array the feed uses,
// so joining or leaving a ride updates them instantly — no extra API calls.
function MyRides({ rides, currentUser, onJoin, onLeave, onDelete, onRiderClick }) {
  // Rides where I'm the organizer
  const createdByMe = rides.filter(
    (ride) => ride.creator && ride.creator.id === currentUser.id
  );

  // Rides organized by someone else where I'm on the participant list
  // (my own rides are left out — they already appear in the list above)
  const joining = rides.filter(
    (ride) =>
      (!ride.creator || ride.creator.id !== currentUser.id) &&
      ride.participants.some((person) => person.id === currentUser.id)
  );

  return (
    <>
      <h1 className="page-title">My rides</h1>

      <section className="myrides-section">
        <h2>🛠️ Rides I created ({createdByMe.length})</h2>
        <RideFeed
          rides={createdByMe}
          currentUser={currentUser}
          onJoin={onJoin}
          onLeave={onLeave}
          onDelete={onDelete}
          onRiderClick={onRiderClick}
          emptyMessage="You haven't created any rides yet."
        />
      </section>

      <section className="myrides-section">
        <h2>🤝 Rides I'm joining ({joining.length})</h2>
        <RideFeed
          rides={joining}
          currentUser={currentUser}
          onJoin={onJoin}
          onLeave={onLeave}
          onDelete={onDelete}
          onRiderClick={onRiderClick}
          emptyMessage="You haven't joined any rides organized by others yet."
        />
      </section>
    </>
  );
}

export default MyRides;

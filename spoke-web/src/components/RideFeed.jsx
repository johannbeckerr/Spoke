import RideCard from './RideCard.jsx';

// A list of ride cards. Used by the public feed and (twice) by My Rides,
// each with its own message for when the list is empty.
function RideFeed({
  rides,
  currentUser,
  onJoin,
  onLeave,
  onDelete,
  onRiderClick,
  emptyMessage = 'No rides yet. Be the first to create one! 🚵',
}) {
  if (rides.length === 0) {
    return (
      <div className="empty-feed">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="ride-feed">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
          currentUser={currentUser}
          onJoin={onJoin}
          onLeave={onLeave}
          onDelete={onDelete}
          onRiderClick={onRiderClick}
        />
      ))}
    </div>
  );
}

export default RideFeed;

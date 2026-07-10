import Avatar from './Avatar.jsx';

// The expanded ride card's roster: a strict vertical stack, one full-width
// row per participant — square photo tile (or pastel initial) plus name.
// Every row is a button: tapping it opens that rider's mini-profile.
function RiderList({ riders, onRiderClick }) {
  return (
    <ul className="rider-list">
      {riders.map((person) => (
        <li key={person.id} className="rider-row">
          <button className="rider-btn" onClick={() => onRiderClick(person)}>
            <Avatar user={person} variant="tile" />
            <span className="rider-name">{person.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RiderList;

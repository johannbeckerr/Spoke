import { useState } from 'react';
import { RIDE_TYPES, PACES } from '../constants.js';

// Form to create a new ride. It only collects the values; the actual
// API call happens in App via the onCreate prop.
function CreateRideForm({ onCreate }) {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [rideType, setRideType] = useState('Road');
  const [pace, setPace] = useState('Beginner');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await onCreate({ startPoint, destination, dateTime, rideType, pace });
      // Success — App hides the form, nothing left to do here
    } catch {
      setError('Could not create the ride. Please try again.');
    }
  }

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Create a ride</h2>

      <div className="form-row">
        <label className="field">
          Starting point
          <input
            className="input"
            type="text"
            placeholder="e.g. Central Station"
            value={startPoint}
            onChange={(event) => setStartPoint(event.target.value)}
            required
          />
        </label>

        <label className="field">
          Destination
          <input
            className="input"
            type="text"
            placeholder="e.g. Lake Loop"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          Date &amp; time
          <input
            className="input"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />
        </label>

        <label className="field">
          Ride type
          <select
            className="input"
            value={rideType}
            onChange={(event) => setRideType(event.target.value)}
          >
            {RIDE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Pace / level
          <select
            className="input"
            value={pace}
            onChange={(event) => setPace(event.target.value)}
          >
            {PACES.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary" type="submit">
        Publish ride
      </button>
    </form>
  );
}

export default CreateRideForm;

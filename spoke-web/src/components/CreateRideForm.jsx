import { useState, useRef } from 'react';
import { RIDE_TYPES, PACES } from '../constants.js';

// Free, no-key-required geocoding — good enough for an MVP location autocomplete
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 500; // be polite to the free public API — don't fetch on every keystroke

// Nominatim's display_name is very long ("Phoenix Park, Chesterfield Avenue, Ashtown, Dublin...").
// Keep just the first two comma-separated parts so the dropdown stays on one clean line.
function shortName(displayName) {
  return displayName.split(',').slice(0, 2).join(', ');
}

// Form to create a new ride. It only collects the values; the actual
// API call happens in App via the onCreate prop.
function CreateRideForm({ onCreate }) {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [rideType, setRideType] = useState('Road');
  const [pace, setPace] = useState('Beginner');
  const [error, setError] = useState('');

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  // Coordinates of the picked location — null until one is chosen from the dropdown
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // One debounce timer per field so typing in one doesn't cancel the other's lookup
  const startTimer = useRef(null);
  const destinationTimer = useRef(null);

  async function fetchSuggestions(query, setSuggestions) {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ie`
      );
      const results = await response.json();
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  }

  function handleStartPointChange(event) {
    const value = event.target.value;
    setStartPoint(value);
    setOriginCoords(null); // typing invalidates the previously picked location
    clearTimeout(startTimer.current);
    startTimer.current = setTimeout(() => fetchSuggestions(value, setStartSuggestions), DEBOUNCE_MS);
  }

  function handleDestinationChange(event) {
    const value = event.target.value;
    setDestination(value);
    setDestinationCoords(null); // typing invalidates the previously picked location
    clearTimeout(destinationTimer.current);
    destinationTimer.current = setTimeout(
      () => fetchSuggestions(value, setDestinationSuggestions),
      DEBOUNCE_MS
    );
  }

  function selectStartSuggestion(place) {
    setStartPoint(shortName(place.display_name));
    setOriginCoords({ lat: place.lat, lon: place.lon });
    setStartSuggestions([]);
  }

  function selectDestinationSuggestion(place) {
    setDestination(shortName(place.display_name));
    setDestinationCoords({ lat: place.lat, lon: place.lon });
    setDestinationSuggestions([]);
  }

  // Build a universal Google Maps search link for a { lat, lon } pair
  function mapsLink(coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await onCreate({
        startPoint,
        destination,
        dateTime,
        rideType,
        pace,
        // null when the user typed a value instead of picking from the dropdown
        origin_lat: originCoords ? originCoords.lat : null,
        origin_lon: originCoords ? originCoords.lon : null,
        destination_lat: destinationCoords ? destinationCoords.lat : null,
        destination_lon: destinationCoords ? destinationCoords.lon : null,
      });
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
          <span className="field-label">Starting point</span>
          <div className="autocomplete-wrap">
            <input
              className="input"
              type="text"
              placeholder="e.g. Central Station"
              value={startPoint}
              onChange={handleStartPointChange}
              onBlur={() => setTimeout(() => setStartSuggestions([]), 150)}
              autoComplete="off"
              required
            />
            {startSuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {startSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    className="autocomplete-item"
                    onMouseDown={() => selectStartSuggestion(place)}
                  >
                    {shortName(place.display_name)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {originCoords && (
            <a
              className="map-link"
              href={mapsLink(originCoords)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </a>
          )}
        </label>

        <label className="field">
          <span className="field-label">Destination</span>
          <div className="autocomplete-wrap">
            <input
              className="input"
              type="text"
              placeholder="e.g. Lake Loop"
              value={destination}
              onChange={handleDestinationChange}
              onBlur={() => setTimeout(() => setDestinationSuggestions([]), 150)}
              autoComplete="off"
              required
            />
            {destinationSuggestions.length > 0 && (
              <div className="autocomplete-dropdown">
                {destinationSuggestions.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    className="autocomplete-item"
                    onMouseDown={() => selectDestinationSuggestion(place)}
                  >
                    {shortName(place.display_name)}
                  </button>
                ))}
              </div>
            )}
          </div>
          {destinationCoords && (
            <a
              className="map-link"
              href={mapsLink(destinationCoords)}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Map
            </a>
          )}
        </label>
      </div>

      <div className="form-row">
        <label className="field">
          <span className="field-label">Date &amp; time</span>
          <input
            className="input"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Ride type</span>
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
          <span className="field-label">Pace / level</span>
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

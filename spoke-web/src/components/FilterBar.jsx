import { RIDE_TYPES, PACES, EMPTY_FILTERS } from '../constants.js';

// Three simple controls that narrow down the feed. This component only
// holds the inputs — the actual filtering is a plain array .filter() in App.
function FilterBar({ filters, onChange }) {
  const hasActiveFilters =
    filters.date !== '' || filters.rideType !== 'All' || filters.pace !== 'All';

  return (
    <div className="filter-bar">
      <label className="field">
        <span className="field-label">Date</span>
        <input
          className="input"
          type="date"
          value={filters.date}
          onChange={(event) => onChange({ ...filters, date: event.target.value })}
        />
      </label>

      <label className="field">
        <span className="field-label">Ride type</span>
        <select
          className="input"
          value={filters.rideType}
          onChange={(event) => onChange({ ...filters, rideType: event.target.value })}
        >
          <option value="All">All types</option>
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
          value={filters.pace}
          onChange={(event) => onChange({ ...filters, pace: event.target.value })}
        >
          <option value="All">All levels</option>
          {PACES.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </label>

      {hasActiveFilters && (
        <button className="btn btn-ghost" onClick={() => onChange(EMPTY_FILTERS)}>
          ✕ Clear
        </button>
      )}
    </div>
  );
}

export default FilterBar;

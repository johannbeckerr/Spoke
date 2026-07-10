import { useEffect, useState } from 'react';

// A rider's profile photo: a hard square with the calibrated black outline
// and a flat offset shadow, in two sizes:
// - "block": oversized, for the header identity slot
// - "tile":  compact, for ride roster rows
// Password accounts have no photo (pictureUrl is null) and a URL can stop
// working — both fall back to the rider's initial: solid ink in the header,
// a per-rider pastel tone in rosters so lists stay colorful but stable.
const FALLBACK_TONES = ['#dbeafe', '#ffedd5', '#fef3c7', '#f3e8ff', '#d1fae5', '#bae6fd', '#fecdd3'];

function Avatar({ user, variant = 'tile' }) {
  const [failed, setFailed] = useState(false);
  const initial = (user.name || '?').trim().charAt(0).toUpperCase();

  // A new URL (fresh login, changed Google photo) deserves a fresh try,
  // even if the previous one had failed.
  useEffect(() => setFailed(false), [user.pictureUrl]);

  const classes = `avatar avatar-${variant}`;

  if (!user.pictureUrl || failed) {
    // Keyed on id, so the same rider gets the same tone on every card
    const tone =
      variant === 'tile'
        ? { background: FALLBACK_TONES[user.id % FALLBACK_TONES.length], color: '#0b112d' }
        : undefined;
    return (
      <span className={`${classes} avatar-fallback`} style={tone} aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <img
      className={classes}
      src={user.pictureUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default Avatar;

import { useEffect, useState } from 'react';

// Round profile photo with a hard black outline — the one circle the
// brutalist style allows. Password accounts have no photo (pictureUrl is
// null), and a photo URL can stop working — both cases fall back to a solid
// ink block showing the rider's initial.
function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  const initial = (user.name || '?').trim().charAt(0).toUpperCase();

  // A new URL (fresh login, changed Google photo) deserves a fresh try,
  // even if the previous one had failed.
  useEffect(() => setFailed(false), [user.pictureUrl]);

  if (!user.pictureUrl || failed) {
    return (
      <span className="avatar avatar-fallback" aria-hidden="true">
        {initial}
      </span>
    );
  }

  return (
    <img
      className="avatar"
      src={user.pictureUrl}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default Avatar;

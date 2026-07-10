import { useState } from 'react';
import ProfileView from './ProfileView.jsx';
import { bikePhotoUrl } from '../api.js';

// The Profile screen, in two modes:
// - "edit": the form — riding style + a bike photo picked straight from
//   the device. Saving flips to...
// - "view": the same mini-profile template other riders see, so you
//   instantly see your profile the way the club sees it.
//
// The photo never leaves the device at full size: it is drawn onto a
// canvas capped at 900px and re-encoded as a compact JPEG data URL first.
// A full-resolution phone photo is several MB; this keeps uploads around
// 100–200 KB, which is what the server's size limit expects.
const MAX_PHOTO_EDGE = 900;

function shrinkToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image — please try another file.'));
    };
    image.src = objectUrl;
  });
}

function EditProfile({ user, rides, onSave }) {
  // View-first: a filled profile opens as the finished card. An EMPTY
  // profile skips straight to the form — its view page would contain
  // nothing but a "create it" button, which is a pointless extra tap.
  const [mode, setMode] = useState(user.ridingStyle || user.hasBikePhoto ? 'view' : 'edit');
  const [ridingStyle, setRidingStyle] = useState(user.ridingStyle || '');
  // Data URL of a newly picked photo; null = keep whatever the server has
  const [bikePhoto, setBikePhoto] = useState(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // For showing the photo that is already saved on the server: a fresh
  // cache-buster per visit (so a photo saved a minute ago wins over the
  // browser's cached copy), and a flag to hide it if the request fails.
  const [photoKey, setPhotoKey] = useState(() => Date.now());
  const [currentPhotoFailed, setCurrentPhotoFailed] = useState(false);

  async function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    setError('');
    setReading(true);
    try {
      setBikePhoto(await shrinkToDataUrl(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Only send the photo when a new one was chosen — the backend
      // treats a missing bikePhoto as "keep the current one"
      await onSave({
        ridingStyle: ridingStyle.trim(),
        ...(bikePhoto ? { bikePhoto } : {}),
      });
      setMode('view'); // straight to "this is how the club sees you"
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function backToEdit() {
    // Re-seed from the freshly saved user (App updated the prop on save)
    setRidingStyle(user.ridingStyle || '');
    setBikePhoto(null);
    setError('');
    setPhotoKey(Date.now()); // the saved photo may have just changed
    setCurrentPhotoFailed(false);
    setMode('edit');
  }

  if (mode === 'view') {
    return (
      <div className="profile-card">
        <ProfileView rider={user} rides={rides} onCreateProfile={backToEdit} />
        {/* An empty profile already shows ProfileView's "create" CTA —
            don't stack a second button that does the same thing */}
        {(user.ridingStyle || user.hasBikePhoto) && (
          <button className="profile-cta" onClick={backToEdit}>
            Edit profile
          </button>
        )}
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2>My profile</h2>

      <label className="field">
        <span className="field-label">Riding style</span>
        <input
          className="input"
          type="text"
          placeholder="e.g. Social & Coffee"
          maxLength={60}
          value={ridingStyle}
          onChange={(event) => setRidingStyle(event.target.value)}
        />
      </label>

      <div className="field">
        <span className="field-label">Bike photo</span>
        {/* The label triggers the hidden file input, so the visible
            control can be a proper brutalist block instead of the
            browser's default file widget */}
        <label className="file-trigger">
          {reading
            ? 'Reading photo…'
            : bikePhoto
              ? 'Photo ready — pick another?'
              : user.hasBikePhoto
                ? 'Change bike photo'
                : 'Choose bike photo'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        {/* Newly picked photo, or — so a saved photo never LOOKS lost —
            the one already on the server */}
        {bikePhoto ? (
          <img className="file-preview" src={bikePhoto} alt="Your new bike photo" />
        ) : user.hasBikePhoto && !currentPhotoFailed ? (
          <img
            className="file-preview"
            src={`${bikePhotoUrl(user.id)}?t=${photoKey}`}
            alt="Your current bike photo"
            onError={() => setCurrentPhotoFailed(true)}
          />
        ) : null}
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary btn-full" type="submit" disabled={reading || saving}>
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}

export default EditProfile;

// Full-screen cover shown while logging out: on the phone this waits for
// Google Play Services to drop its session, then the remembered user is
// purged. Styled like the app's other brutalist modals — hard borders,
// square corners, a chunky block loader instead of a smooth spinner.
function LogoutOverlay() {
  return (
    <div className="logout-overlay" role="alert" aria-busy="true">
      <div className="logout-card">
        <p className="logout-title">Logging off…</p>
        <div className="logout-bar">
          <div className="logout-bar-fill" />
        </div>
      </div>
    </div>
  );
}

export default LogoutOverlay;

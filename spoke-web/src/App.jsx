import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import * as api from './api.js';
import { EMPTY_FILTERS } from './constants.js';
import AuthScreen from './components/AuthScreen.jsx';
import CreateRideForm from './components/CreateRideForm.jsx';
import EditProfile from './components/EditProfile.jsx';
import FeedbackSection from './components/FeedbackSection.jsx';
import FilterBar from './components/FilterBar.jsx';
import Header from './components/Header.jsx';
import LogoutOverlay from './components/LogoutOverlay.jsx';
import MyRides from './components/MyRides.jsx';
import RideFeed from './components/RideFeed.jsx';
import RiderProfile from './components/RiderProfile.jsx';
import WelcomeModal from './components/WelcomeModal.jsx';

// The root component owns all the shared state:
// - who is logged in (null = browsing anonymously)
// - the list of rides (single source of truth for feed AND My Rides)
// - which screen is visible: 'feed', 'auth' or 'myrides' (no router library)
// The feed is public; logging in is only required to join or create rides.
function App() {
  // Restore the user from localStorage so a page refresh keeps you logged in.
  // (The "v2" key invalidates sessions from the old name-only login system.)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spokeUser.v2');
    return saved ? JSON.parse(saved) : null;
  });

  const [rides, setRides] = useState([]);
  const [error, setError] = useState('');
  const [screen, setScreen] = useState('feed');
  const [loggingOut, setLoggingOut] = useState(false);
  // The rider whose mini-profile is open (from tapping a roster row), or null
  const [selectedRider, setSelectedRider] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Shown once per login, when the user lands on the dashboard
  // Show the alpha notice once per browser-tab session (sessionStorage clears
  // when the tab closes, so it reappears in a new tab but not on every refresh).
  const [showWelcome, setShowWelcome] = useState(
    () => sessionStorage.getItem('spokeWelcomeSeen') !== 'true'
  );

  function dismissWelcome() {
    sessionStorage.setItem('spokeWelcomeSeen', 'true');
    setShowWelcome(false);
  }

  // Load the ride feed right away — no login needed to look around
  useEffect(() => {
    api
      .getRides()
      .then(setRides)
      .catch(() => setError('Could not load rides. Is the backend running on port 8080?'));
  }, []);

  // Runs once when the app opens. If a remembered user was restored above,
  // quietly confirm the account still exists on the server — the dev database
  // is in-memory and empty after every backend restart, so a remembered login
  // can point at a user that is gone. Confirmed: store the freshest copy.
  // Gone (404): log out. Network trouble: leave the session alone — being
  // offline for a moment is not a reason to log someone out.
  useEffect(() => {
    if (!user) return;
    api
      .getUser(user.id)
      .then((freshUser) => {
        localStorage.setItem('spokeUser.v2', JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch((err) => {
        if (err.status === 404) handleLogout();
      });
  }, []);

  // Apply the feed filters with a plain array filter. A ride is visible
  // when every active control matches it ('All' / empty date match anything).
  const visibleRides = rides.filter((ride) => {
    const matchesDate = filters.date === '' || ride.dateTime.startsWith(filters.date);
    const matchesType = filters.rideType === 'All' || ride.rideType === filters.rideType;
    const matchesPace = filters.pace === 'All' || ride.pace === filters.pace;
    return matchesDate && matchesType && matchesPace;
  });

  function saveUser(loggedInUser) {
    localStorage.setItem('spokeUser.v2', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setScreen('feed'); // back to the feed (the dashboard)
  }

  async function handleLogin(email, password) {
    saveUser(await api.login(email, password));
  }

  async function handleRegister(name, email, password) {
    saveUser(await api.register(name, email, password));
  }

  // credential is the JWT Google gave the browser; the backend verifies it
  // and returns the same { id, name, email } shape as a password login.
  async function handleGoogleLogin(credential) {
    saveUser(await api.googleLogin(credential));
  }

  async function handleLogout() {
    // A full-screen "logging off" cover replaces an abrupt screen snap.
    // It never shows for less than a beat: an instant flash reads as a
    // glitch, not as feedback.
    setLoggingOut(true);
    const minimumShow = new Promise((resolve) => setTimeout(resolve, 900));

    // On the phone, also make Google Play Services forget the session, so the
    // next "Continue with Google" shows the account picker again instead of
    // silently reusing the last account. If Google errors, log out anyway —
    // a signOut failure must never leave someone stuck logged in.
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
      } catch (err) {
        console.error('GoogleAuth.signOut() failed:', err);
      }
    }

    localStorage.removeItem('spokeUser.v2');
    setUser(null);
    setShowForm(false);
    setScreen('feed'); // My Rides is not available anymore

    await minimumShow;
    setLoggingOut(false);
  }

  // Save the profile extras, then refresh the rides: every roster embeds
  // its own copy of each rider, so the lists must be re-fetched for the
  // new details to show up in other people's cards immediately. The
  // Profile screen stays put — it flips itself to the profile view.
  async function handleSaveProfile(profileData) {
    const updatedUser = await api.updateProfile(user.id, profileData);
    localStorage.setItem('spokeUser.v2', JSON.stringify(updatedUser));
    setUser(updatedUser);
    api.getRides().then(setRides).catch(() => {});
  }

  async function handleCreateRide(rideData) {
    const newRide = await api.createRide({ ...rideData, creatorId: user.id });
    // Add the new ride and keep the feed sorted by date, soonest first
    setRides((current) =>
      [...current, newRide].sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    );
    setShowForm(false);
  }

  // Join and leave both return the updated ride from the server;
  // we swap it into our list so the UI reflects the real database state.
  function replaceRide(updatedRide) {
    setRides((current) =>
      current.map((ride) => (ride.id === updatedRide.id ? updatedRide : ride))
    );
  }

  // Anonymous visitors get sent to the login screen when they try to act
  async function handleJoin(rideId) {
    if (!user) return setScreen('auth');
    replaceRide(await api.joinRide(rideId, user.id));
  }

  async function handleLeave(rideId) {
    if (!user) return setScreen('auth');
    replaceRide(await api.leaveRide(rideId, user.id));
  }

  function handleNewRideClick() {
    if (!user) return setScreen('auth');
    setShowForm(!showForm);
  }

  // The backend rejects this with 403 unless the user is the ride's creator;
  // the button is only shown to the creator anyway (see RideCard).
  async function handleDelete(rideId) {
    if (!user) return setScreen('auth');
    await api.deleteRide(rideId, user.id);
    setRides((current) => current.filter((ride) => ride.id !== rideId));
  }

  // Rendered on every screen (including the auth screen below), so the alpha
  // notice shows whenever the app opens, regardless of login state.
  const welcomeModal = showWelcome ? <WelcomeModal onClose={dismissWelcome} /> : null;

  if (screen === 'auth') {
    return (
      <>
        {welcomeModal}
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          onGoogleLogin={handleGoogleLogin}
          onBack={() => setScreen('feed')}
        />
      </>
    );
  }

  // 'myrides' and 'profile' are protected — without a user we fall back
  // to the feed
  const onMyRides = screen === 'myrides' && user != null;
  const onProfile = screen === 'profile' && user != null;
  const onFeedback = screen === 'feedback';
  // Which screen the main area is actually showing (after the fallbacks
  // above). Used as a React key: changing it remounts the wrapper, which
  // replays the hard slide-in — that IS the screen transition.
  const mainScreen = onFeedback ? 'feedback' : onProfile ? 'profile' : onMyRides ? 'myrides' : 'feed';

  return (
    <div className="app">
      {welcomeModal}
      {loggingOut && <LogoutOverlay />}
      {selectedRider && (
        <RiderProfile
          rider={selectedRider}
          rides={rides}
          currentUser={user}
          onCreateProfile={() => {
            // Tapping yourself in a roster with an empty profile: close
            // the modal and land straight in the profile editor
            setSelectedRider(null);
            setScreen('profile');
          }}
          onClose={() => setSelectedRider(null)}
        />
      )}

      <Header user={user} onMyRides={onMyRides} onNavigate={setScreen} onLogout={handleLogout} />

      <main className="app-main">
        {error && <p className="error-banner">{error}</p>}

        <div className="screen-slide" key={mainScreen}>
        {onFeedback ? (
          <FeedbackSection user={user} onLoginRedirect={() => setScreen('auth')} />
        ) : onProfile ? (
          <EditProfile user={user} rides={rides} onSave={handleSaveProfile} />
        ) : onMyRides ? (
          <MyRides
            rides={rides}
            currentUser={user}
            onJoin={handleJoin}
            onLeave={handleLeave}
            onDelete={handleDelete}
            onRiderClick={setSelectedRider}
          />
        ) : (
          <>
            <div className="feed-toolbar">
              <h1>Upcoming rides</h1>
              <button className="btn btn-primary" onClick={handleNewRideClick}>
                {showForm ? 'Cancel' : '+ New ride'}
              </button>
            </div>

            <FilterBar filters={filters} onChange={setFilters} />

            {showForm && <CreateRideForm onCreate={handleCreateRide} />}

            <RideFeed
              rides={visibleRides}
              currentUser={user}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onDelete={handleDelete}
              onRiderClick={setSelectedRider}
              emptyMessage={
                rides.length > 0 && visibleRides.length === 0
                  ? 'No rides match your filters.'
                  : undefined
              }
            />
          </>
        )}
        </div>
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { CloseIcon, MenuIcon } from './icons.jsx';
import Avatar from './Avatar.jsx';
import SupportModal from './SupportModal.jsx';

// The top bar, responsive without any UI library:
// - desktop (> 640px): logo left, nav links + user info right (plain flexbox)
// - mobile  (≤ 640px): logo left, hamburger right; tapping it opens a menu panel
// A CSS media query decides which version is visible; React only remembers
// whether the mobile menu is open.
function Header({ user, onMyRides, onNavigate, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Navigating anywhere closes the mobile menu
  function go(screen) {
    setIsMenuOpen(false);
    onNavigate(screen);
  }

  // The support link opens a modal (not a screen), so close the menu first
  function openSupport() {
    setIsMenuOpen(false);
    setShowSupport(true);
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    onLogout();
  }

  return (
    <header className="app-header">
      <div className="header-row">
        {/* The header's anchor slot follows the login state: signed in it
            shows the rider (photo + first name, tap = back to the feed);
            signed out it becomes the one LOG IN block for the whole app. */}
        {user ? (
          <button className="identity" onClick={() => go('feed')}>
            <Avatar user={user} />
            <span className="identity-name">{user.name.split(' ')[0]}</span>
          </button>
        ) : (
          <button className="header-login" onClick={() => go('auth')}>
            Log in
          </button>
        )}

        {/* Desktop navigation — hidden on small screens by CSS */}
        <div className="header-desktop">
          {user ? (
            <>
              <nav className="nav">
                <button
                  className={`nav-link ${onMyRides ? '' : 'active'}`}
                  onClick={() => go('feed')}
                >
                  All rides
                </button>
                <button
                  className={`nav-link ${onMyRides ? 'active' : ''}`}
                  onClick={() => go('myrides')}
                >
                  My rides
                </button>
                <button className="nav-link" onClick={() => go('feedback')}>
                  Feedback
                </button>
                <button className="nav-link" onClick={openSupport}>
                  Support the Project
                </button>
              </nav>
              <button className="btn btn-ghost" onClick={handleLogoutClick}>
                Log out
              </button>
            </>
          ) : (
            // Logged out, the LOG IN block on the left is the only door in,
            // so the right side is just the public links
            <nav className="nav">
              <button className="nav-link" onClick={() => go('feedback')}>
                Feedback
              </button>
              <button className="nav-link" onClick={openSupport}>
                Support the Project
              </button>
            </nav>
          )}
        </div>

        {/* Hamburger toggle — only visible on small screens. While the menu
            is open the frame inverts to solid ink so the state is obvious. */}
        <button
          className={`hamburger${isMenuOpen ? ' open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu panel — always mounted so the open/close slide can
          play; the .open class moves it, and CSS visibility keeps it out
          of sight (and out of the tab order) while closed. */}
      <nav className={`mobile-menu${isMenuOpen ? ' open' : ''}`}>
        {user ? (
          <>
            <button
              className={`mobile-link ${onMyRides ? '' : 'active'}`}
              onClick={() => go('feed')}
            >
              All rides
            </button>
            <button
              className={`mobile-link ${onMyRides ? 'active' : ''}`}
              onClick={() => go('myrides')}
            >
              My rides
            </button>
            <button className="mobile-link" onClick={() => go('feedback')}>
              Feedback
            </button>
            <button className="mobile-link support-cta" onClick={openSupport}>
              Support the Project
            </button>
            <div className="mobile-menu-footer">
              <span className="greeting">Hi, {user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogoutClick}>
                Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="mobile-link" onClick={() => go('feedback')}>
              Feedback
            </button>
            <button className="mobile-link support-cta" onClick={openSupport}>
              Support the Project
            </button>
          </>
        )}
      </nav>

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </header>
  );
}

export default Header;

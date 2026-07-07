import { useState } from 'react';

// The top bar, responsive without any UI library:
// - desktop (> 640px): logo left, nav links + user info right (plain flexbox)
// - mobile  (≤ 640px): logo left, hamburger right; tapping it opens a menu panel
// A CSS media query decides which version is visible; React only remembers
// whether the mobile menu is open.
function Header({ user, onMyRides, onNavigate, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigating anywhere closes the mobile menu
  function go(screen) {
    setIsMenuOpen(false);
    onNavigate(screen);
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    onLogout();
  }

  return (
    <header className="app-header">
      <div className="header-row">
        <button className="logo logo-button" onClick={() => go('feed')}>
          <span className="logo-icon">🚴</span> Spoke
        </button>

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
              </nav>
              <span className="greeting">Hi, {user.name}</span>
              <button className="btn btn-ghost" onClick={handleLogoutClick}>
                Log out
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => go('auth')}>
              Log in
            </button>
          )}
        </div>

        {/* Hamburger toggle — only visible on small screens */}
        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu panel — only rendered while open */}
      {isMenuOpen && (
        <nav className="mobile-menu">
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
              <div className="mobile-menu-footer">
                <span className="greeting">Hi, {user.name}</span>
                <button className="btn btn-ghost" onClick={handleLogoutClick}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <button className="btn btn-primary btn-full" onClick={() => go('auth')}>
              Log in
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;

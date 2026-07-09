import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { SpokeLogoIcon } from './icons.jsx';

// A friendly stand-in for the raw "Request failed: 401 Unauthorized" the API throws
const LOGIN_FAILED_MESSAGE =
  "We couldn't find an account with those details. Please check your email and password and try again.";

// One screen, two modes: "login" for existing users, "signup" for new ones.
// The button at the bottom switches between them.
function AuthScreen({ onLogin, onRegister, onGoogleLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  function switchMode() {
    setMode(isLogin ? 'signup' : 'login');
    setError('');
  }

  // Google's button gives us a JWT ("credential"); the backend verifies it.
  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    try {
      await onGoogleLogin(credentialResponse.credential);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setError('');

    try {
      if (isLogin) {
        await onLogin(email.trim(), password);
      } else {
        await onRegister(name.trim(), email.trim(), password);
      }
      // Success — App switches back to the feed, nothing left to do here
    } catch (err) {
      setError(err.status === 401 ? LOGIN_FAILED_MESSAGE : err.message);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo-mark">
          Sp<SpokeLogoIcon className="login-logo-icon" />ke
        </div>

        <form onSubmit={handleSubmit}>
          {/* The name field only exists when signing up */}
          {!isLogin && (
            <input
              className="input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
            />
          )}

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus={isLogin}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="btn btn-primary btn-full" type="submit">
            {isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        {/* Same button for logging in and signing up: the backend creates
            the account the first time it sees a new Google email. */}
        <div className="google-login">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-outline btn-full" onClick={switchMode}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>

        <button className="btn btn-ghost btn-full" onClick={onBack}>
          ← Back to rides
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;

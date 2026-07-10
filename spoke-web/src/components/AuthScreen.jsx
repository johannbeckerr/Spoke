import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SpokeLogoIcon } from './icons.jsx';

// A friendly stand-in for the raw "Request failed: 401 Unauthorized" the API throws
const LOGIN_FAILED_MESSAGE =
  "We couldn't find an account with those details. Please check your email and password and try again.";
const GOOGLE_FAILED_MESSAGE = 'Google sign-in failed. Please try again.';
const SERVER_UNREACHABLE_MESSAGE =
  'Google sign-in worked, but the Spoke server could not be reached. Please try again in a minute.';

// True inside the Android shell, false in a browser tab. It cannot change while
// the app is running, so read it once rather than on every render.
const IS_NATIVE = Capacitor.isNativePlatform();

// The plugin rejects with an ordinary Error both when sign-in genuinely fails
// and when the user just backs out of the account picker. Android reports a
// cancelled sign-in as status 12501, which the plugin puts in `code`.
function isCancellation(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase();
  return text.includes('12501') || text.includes('cancel');
}

// One screen, two modes: "login" for existing users, "signup" for new ones.
// The button at the bottom switches between them.
function AuthScreen({ onLogin, onRegister, onGoogleLogin, onBack }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  const isLogin = mode === 'login';

  function switchMode() {
    setMode(isLogin ? 'signup' : 'login');
    setError('');
  }

  // Web: Google's own button hands us the ID token as `credential`. The
  // backend call afterwards can take a while (the free server sleeps when
  // idle), so we show a busy indicator instead of a silent dead button.
  async function handleWebGoogleSuccess(credentialResponse) {
    setError('');
    setGoogleBusy(true);
    try {
      await onGoogleLogin(credentialResponse.credential);
    } catch (err) {
      setError(err.status ? err.message : SERVER_UNREACHABLE_MESSAGE);
    } finally {
      setGoogleBusy(false);
    }
  }

  // Native: the plugin opens Android's account picker and resolves with the
  // whole Google profile. The same ID token is tucked inside `authentication`,
  // so from onGoogleLogin onwards both platforms look identical.
  async function handleNativeGoogleClick() {
    setError('');
    setGoogleBusy(true);

    // Step 1: Google itself. A failure here is a native setup problem, and
    // the Play Services status code (e.g. 10 = DEVELOPER_ERROR, a console or
    // signature mismatch) is the only real clue — keep it visible instead of
    // burying it under a generic message.
    let googleUser;
    try {
      googleUser = await GoogleAuth.signIn();
    } catch (err) {
      console.error('GoogleAuth.signIn() failed:', err);
      if (!isCancellation(err)) {
        setError(err.code ? `${GOOGLE_FAILED_MESSAGE} (native error ${err.code})` : GOOGLE_FAILED_MESSAGE);
      }
      setGoogleBusy(false);
      return;
    }

    // Step 2: our backend. Errors from api.js carry a `status` and a message
    // worth showing; anything else means the server never answered at all.
    try {
      await onGoogleLogin(googleUser.authentication.idToken);
    } catch (err) {
      setError(err.status ? err.message : SERVER_UNREACHABLE_MESSAGE);
    } finally {
      setGoogleBusy(false);
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

        {/* Google comes first: one tap and you're in, whether or not an
            account exists yet (the backend creates it on first sign-in).
            Google's own button script cannot run in the native webview, so
            Android gets our own brand-blue button that drives the plugin. */}
        <div className="google-login">
          {IS_NATIVE ? (
            <button
              className="btn btn-google btn-full"
              type="button"
              onClick={handleNativeGoogleClick}
              disabled={googleBusy}
            >
              {googleBusy ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Continue with Google'
              )}
            </button>
          ) : googleBusy ? (
            // Google already gave us the credential; while our server checks
            // it, swap the (iframe) button for a plain busy row.
            <p className="google-busy">
              <span className="spinner" aria-hidden="true" />
              Signing you in…
            </p>
          ) : (
            <GoogleLogin
              onSuccess={handleWebGoogleSuccess}
              onError={() => setError(GOOGLE_FAILED_MESSAGE)}
            />
          )}
        </div>

        <div className="auth-divider" aria-hidden="true">
          or
        </div>

        {/* The email form is the fallback route. No autoFocus here: popping
            the keyboard open would shove the primary Google option around. */}
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
            />
          )}

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
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

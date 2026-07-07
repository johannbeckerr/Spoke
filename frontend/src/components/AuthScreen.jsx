import { useState } from 'react';

// One screen, two modes: "login" for existing users, "signup" for new ones.
// The link at the bottom switches between them.
function AuthScreen({ onLogin, onRegister, onBack }) {
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
      setError(err.message);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo login-logo">
          <span className="logo-icon">🚴</span> Spoke
        </div>
        <p className="login-tagline">
          {isLogin ? 'Welcome back!' : 'Create your account.'}
        </p>

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

        {error && <p className="error-text">{error}</p>}

        <p className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="link-button" onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

        <button className="btn btn-ghost btn-full" onClick={onBack}>
          ← Back to rides
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;

import { useState } from 'react';
import * as api from '../api.js';

// Brutalist feedback panel. Three states:
// 1. logged out  -> a prompt with a link to the login screen
// 2. logged in    -> the textarea + submit button
// 3. after submit -> a "FEEDBACK RECEIVED" confirmation
function FeedbackSection({ user, onLoginRedirect }) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // 1. Not logged in — no form, just a prompt.
  if (!user) {
    return (
      <section className="feedback-panel">
        <h2 className="feedback-header">FEEDBACK</h2>
        <div className="feedback-body">
          <p className="feedback-message">Please log in to send feedback.</p>
          <button className="btn btn-primary" onClick={onLoginRedirect}>
            Go to login
          </button>
        </div>
      </section>
    );
  }

  // 3. Already submitted — confirmation only.
  if (submitted) {
    return (
      <section className="feedback-panel">
        <h2 className="feedback-header">FEEDBACK RECEIVED</h2>
        <div className="feedback-body">
          <p className="feedback-message">
            Thanks, {user.name}. Your feedback has been recorded.
          </p>
        </div>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.sendFeedback(user.id, message.trim());
      setSubmitted(true);
    } catch {
      setError('Could not send your feedback. Please try again.');
    }
  }

  // 2. Logged in — the form.
  return (
    <section className="feedback-panel">
      <h2 className="feedback-header">SEND FEEDBACK</h2>
      <form className="feedback-body" onSubmit={handleSubmit}>
        <textarea
          className="feedback-textarea"
          placeholder="Share a suggestion or a complaint..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={8}
          maxLength={1000}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button className="feedback-submit" type="submit">
          Submit feedback
        </button>
      </form>
    </section>
  );
}

export default FeedbackSection;

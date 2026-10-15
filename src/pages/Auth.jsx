import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../lib/api';

/**
 * Auth page — handles both login and register modes against the real backend.
 * Mode is driven by ?mode=register in the URL (so links can target it directly).
 */
export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialMode =
    new URLSearchParams(location.search).get('mode') === 'register'
      ? 'register'
      : 'login';

  const [mode, setMode] = useState(initialMode);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (mode === 'login') {
        await login({ email: data.email, password: data.password });
      } else {
        await register({
          displayName: data.displayName,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next) => {
    setError('');
    setMode(next);
    navigate(next === 'register' ? '/login?mode=register' : '/login');
  };

  return (
    <section className="auth-page">
      <div className="auth-story">
        <div className="auth-story-inner">
          <div className="auth-icon"><BriefcaseBusiness /></div>
          <p className="kicker kicker-light"><Sparkles size={14} /> Your next chapter</p>
          <h1>Work that fits your life, not the other way around.</h1>
          <p>Join people finding clearer opportunities and more human hiring experiences.</p>
          <ul>
            <li><Check /> Personalised job matches</li>
            <li><Check /> One calm application tracker</li>
            <li><Check /> Honest company insights</li>
          </ul>
          <blockquote>
            “I found a role that matched both my skills and the way I want to work.”
            <span>— Maya, Product Designer</span>
          </blockquote>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-box">
          <button className="back-home" onClick={() => navigate('/')}>← Back home</button>
          <p className="kicker">Welcome {mode === 'login' ? 'back' : 'in'}</p>
          <h2>{mode === 'login' ? 'Log in to your account' : 'Create your account'}</h2>
          <p>{mode === 'login' ? 'Keep your job search moving.' : 'Build a profile and start applying.'}</p>

          <div className="auth-tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >Log in</button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >Create account</button>
          </div>

          <div className="divider"><span>or continue with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label>
                Full name
                <input name="displayName" required placeholder="Your name" autoComplete="name" />
              </label>
            )}
            <label>
              Email address
              <input type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={show ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  placeholder={mode === 'register' ? 'At least 6 chars, with upper, lower & digit' : 'Your password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" aria-label="Show password" onClick={() => setShow(!show)}>
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            {mode === 'register' && (
              <label>
                Confirm password
                <input
                  type={show ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
              </label>
            )}
            {error && <p className="form-error">{error}</p>}
            <button className="button auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
              <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-terms">
            By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

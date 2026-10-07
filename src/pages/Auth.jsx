import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, Check, Eye, EyeOff, Sparkles } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Auth() {
  const location = useLocation(), navigate = useNavigate(), googleRef = useRef()
  const [mode, setMode] = useState(new URLSearchParams(location.search).get('mode') === 'register' ? 'register' : 'login')
  const [show, setShow] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const { login, register, googleLogin, demoLogin } = useAuth()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) return
    const timer = setInterval(() => {
      if (!window.google || !googleRef.current) return
      clearInterval(timer)
      window.google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }) => { try { await googleLogin(credential); navigate('/dashboard') } catch (e) { setError(e.message) } } })
      window.google.accounts.id.renderButton(googleRef.current, { type: 'standard', theme: 'outline', size: 'large', width: 400, text: mode === 'register' ? 'signup_with' : 'continue_with' })
    }, 300)
    return () => clearInterval(timer)
  }, [mode])

  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try { mode === 'login' ? await login(data.email, data.password) : await register(data.name, data.email, data.password); navigate('/dashboard') }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return <section className="auth-page">
    <div className="auth-story"><div className="auth-story-inner"><div className="auth-icon"><BriefcaseBusiness/></div><p className="kicker kicker-light"><Sparkles size={14}/> Your next chapter</p><h1>Work that fits your life, not the other way around.</h1><p>Join people finding clearer opportunities and more human hiring experiences.</p><ul><li><Check/> Personalised job matches</li><li><Check/> One calm application tracker</li><li><Check/> Honest company insights</li></ul><blockquote>“I found a role that matched both my skills and the way I want to work.”<span>— Maya, Product Designer</span></blockquote></div></div>
    <div className="auth-panel"><div className="auth-box"><button className="back-home" onClick={() => navigate('/')}>← Back home</button><p className="kicker">Welcome {mode === 'login' ? 'back' : 'in'}</p><h2>{mode === 'login' ? 'Log in to your account' : 'Create your account'}</h2><p>{mode === 'login' ? 'Keep your job search moving.' : 'Build a profile and start applying.'}</p>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button></div>
      <div ref={googleRef} className="google-official"></div>
      {!import.meta.env.VITE_GOOGLE_CLIENT_ID && <button className="google-button" onClick={() => { demoLogin(); navigate('/dashboard') }}><span className="google-g">G</span> Continue with Google <small>preview</small></button>}
      <div className="divider"><span>or continue with email</span></div>
      <form className="auth-form" onSubmit={submit}>{mode === 'register' && <label>Full name<input name="name" required placeholder="Your name" autoComplete="name"/></label>}<label>Email address<input type="email" name="email" required placeholder="you@example.com" autoComplete="email"/></label><label>Password<div className="password-field"><input type={show ? 'text' : 'password'} name="password" required minLength="8" placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/><button type="button" aria-label="Show password" onClick={() => setShow(!show)}>{show ? <EyeOff/> : <Eye/>}</button></div></label>{mode === 'login' && <div className="form-meta"><label><input type="checkbox"/> Remember me</label><a href="#">Forgot password?</a></div>}{error && <p className="form-error">{error}</p>}<button className="button auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'} <ArrowRight size={17}/></button></form>
      <p className="auth-terms">By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</p>
    </div></div>
  </section>
}

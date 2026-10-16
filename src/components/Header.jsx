import { useState } from 'react';
import { Bookmark, BriefcaseBusiness, ChevronDown, FileText, Menu, Sparkles, UserRound, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, isEmployer, logout } = useAuth();
  const name = user?.displayName || user?.email || '';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="JobOrbit home">
          <span className="brand-mark"><BriefcaseBusiness size={18} /></span>
          JobOrbit<span>.</span>
        </Link>
        <button className="mobile-menu" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav open' : 'nav'}>
          <NavLink to="/jobs">Find jobs</NavLink>
          <NavLink to="/practice" className="nav-practice">
            <Sparkles size={14} /> Practice
          </NavLink>
          <a href="/#companies">Companies</a>
          <a href="/#resources">Career resources</a>
        </nav>
        <div className="header-actions">
          {user ? (
            <>
              <Link className="icon-link" to="/resume" title="Build my resume">
                <FileText size={18} /><span>Resume</span>
              </Link>
              <Link className="icon-link" to="/dashboard" title="My jobs">
                <Bookmark size={18} /><span>My jobs</span>
              </Link>
              <Link className="icon-link" to="/employer" title="Employer dashboard">
                <BriefcaseBusiness size={18} /><span>Employer</span>
              </Link>
              <div className="profile-chip">
                <span>{name.charAt(0).toUpperCase()}</span>
                <Link to="/dashboard">{name.split(' ')[0]}</Link>
                {isEmployer && <ChevronDown size={14} />}
              </div>
              <button className="text-button" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="login-link" to="/login"><UserRound size={17} /> Log in</Link>
              <Link className="button button-small" to="/login?mode=register">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

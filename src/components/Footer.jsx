import { BriefcaseBusiness, Linkedin, Instagram, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-intro">
        <Link to="/" className="brand brand-light"><span className="brand-mark"><BriefcaseBusiness size={18}/></span>Naukriya<span>.</span></Link>
        <p>Work can feel better. Find roles where your skills, values and ambitions belong.</p>
        <div className="socials"><a href="#" aria-label="LinkedIn"><Linkedin/></a><a href="#" aria-label="Instagram"><Instagram/></a></div>
      </div>
      <div><h4>For candidates</h4><Link to="/jobs">Browse jobs</Link><a href="/#companies">Companies</a><Link to="/dashboard">Saved jobs</Link><a href="/#resources">Career advice</a></div>
      <div><h4>For employers</h4><a href="#">Post a job</a><a href="#">Employer brand</a><a href="#">Pricing</a><a href="#">Hiring guides</a></div>
      <div><h4>Company</h4><a href="#">About us</a><a href="#">Our mission</a><a href="#">Contact</a><a href="#">Accessibility</a></div>
      <div className="footer-news"><h4>Useful, not noisy.</h4><p>A short weekly note with new roles and career ideas.</p><button>Join the newsletter <ArrowUpRight size={16}/></button></div>
    </div>
    <div className="container footer-bottom"><span>© 2026 Naukriya</span><span><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></span></div>
  </footer>
}

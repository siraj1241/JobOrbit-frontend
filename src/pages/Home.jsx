import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobs } from '../lib/api'
import JobCard from '../components/JobCard'
import { ArrowRight, BarChart3, BriefcaseBusiness, Building2, Code2, HeartHandshake, Landmark, MapPin, Megaphone, Palette, Search, ShieldCheck, Sparkles, UsersRound } from 'lucide-react'

const categories = [
  ['Technology', '2,104 roles', Code2], ['Design', '842 roles', Palette], ['Marketing', '1,229 roles', Megaphone],
  ['Finance', '946 roles', Landmark], ['People & HR', '611 roles', UsersRound], ['Data', '728 roles', BarChart3],
  ['Operations', '1,032 roles', BriefcaseBusiness], ['Customer success', '586 roles', HeartHandshake],
]

export default function Home() {
  const [jobs, setJobs] = useState([])
  const navigate = useNavigate()
  useEffect(() => { getJobs('').then(setJobs) }, [])
  return <>
    <section className="hero">
      <div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div>
      <div className="container hero-inner">
        <p className="kicker"><Sparkles size={14}/> Opportunities, thoughtfully matched</p>
        <h1>Find a job.<br/><em>Build your future.</em></h1>
        <p className="hero-copy">Search purposeful roles from teams that care about the work—and the people doing it.</p>
        <form className="search-bar" onSubmit={e => { e.preventDefault(); const q = new FormData(e.currentTarget).get('q'); navigate(`/jobs?search=${encodeURIComponent(q)}`) }}>
          <label><Search size={19}/><span><small>What</small><input name="q" placeholder="Job title, skill or company"/></span></label>
          <label><MapPin size={19}/><span><small>Where</small><input name="location" placeholder="City or remote"/></span></label>
          <button className="button" type="submit">Search jobs <ArrowRight size={18}/></button>
        </form>
        <div className="popular"><span>Popular:</span><button onClick={() => navigate('/jobs?search=Product')}>Product</button><button onClick={() => navigate('/jobs?search=Design')}>Design</button><button onClick={() => navigate('/jobs?search=Remote')}>Remote</button><button onClick={() => navigate('/jobs?search=Data')}>Data</button></div>
      </div>
    </section>
    <section className="section category-section">
      <div className="container">
        <div className="section-heading"><div><p className="kicker">Explore your path</p><h2>Opportunities in every direction</h2></div><button className="link-arrow" onClick={() => navigate('/jobs')}>View all categories <ArrowRight size={17}/></button></div>
        <div className="category-grid">{categories.map(([name, count, Icon]) => <button key={name} onClick={() => navigate(`/jobs?search=${name}`)} className="category-card"><span><Icon size={20}/></span><div><strong>{name}</strong><small>{count}</small></div><ArrowRight size={16}/></button>)}</div>
      </div>
    </section>
    <section className="section section-tint">
      <div className="container">
        <div className="section-heading"><div><p className="kicker">Fresh opportunities</p><h2>Find work you’ll feel good about</h2><p>Hand-picked roles from companies building with care.</p></div><button className="link-arrow" onClick={() => navigate('/jobs')}>Browse all jobs <ArrowRight size={17}/></button></div>
        <div className="job-grid">{jobs.slice(0, 4).map(job => <JobCard key={job.id} job={job}/>)}</div>
      </div>
    </section>
    <section className="section process-section">
      <div className="container">
        <div className="section-heading"><div><p className="kicker">A clearer way forward</p><h2>A job search that respects your time</h2></div></div>
        <div className="process-grid">
          <article><span>01</span><Search/><h3>Search with intention</h3><p>Use useful filters and honest company information to focus on roles that fit.</p></article>
          <article><span>02</span><ShieldCheck/><h3>Apply with confidence</h3><p>A simple profile and transparent process—no application black holes.</p></article>
          <article><span>03</span><Sparkles/><h3>Make your move</h3><p>Track every step and get practical guidance from first click to first day.</p></article>
        </div>
      </div>
    </section>
    <section className="section company-section" id="companies">
      <div className="container company-feature">
        <div className="company-visual"><div className="portrait p-one">NS</div><div className="portrait p-two">PL</div><div className="portrait p-three">OM</div><div className="metric-card"><strong>4.8</strong><span>team happiness</span></div></div>
        <div className="company-copy"><p className="kicker">Company spotlight</p><h2>People do their best work where they can be themselves.</h2><p>Meet Northstar Labs: a product studio with flexible schedules, six learning days each year, and a commitment to meaningful work.</p><div className="stat-row"><span><strong>92%</strong> would recommend</span><span><strong>4.8/5</strong> culture score</span><span><strong>18</strong> open roles</span></div><button className="link-arrow" onClick={() => navigate('/jobs?search=Northstar')}>Meet Northstar Labs <ArrowRight size={17}/></button></div>
      </div>
    </section>
    <section className="section resources" id="resources">
      <div className="container">
        <div className="section-heading"><div><p className="kicker">Career resources</p><h2>Better decisions start here</h2></div><button className="link-arrow">See all resources <ArrowRight size={17}/></button></div>
        <div className="article-grid">
          <article><div className="article-art art-one"><span>CV</span></div><small>Job search · 7 min</small><h3>A CV that sounds like you—and gets read</h3><p>Make every line clear, human and relevant.</p><a href="#resources">Read guide <ArrowRight size={15}/></a></article>
          <article><div className="article-art art-two"><span>“ ”</span></div><small>Interviews · 6 min</small><h3>Questions worth asking your next manager</h3><p>Learn what the job description leaves out.</p><a href="#resources">Read guide <ArrowRight size={15}/></a></article>
          <article><div className="article-art art-three"><BarChart3/></div><small>Growth · 8 min</small><h3>How to talk about salary with confidence</h3><p>Practical language for a fair conversation.</p><a href="#resources">Read guide <ArrowRight size={15}/></a></article>
        </div>
      </div>
    </section>
    <section className="section"><div className="container app-banner">
      <div><p className="kicker kicker-light">Your search, in your pocket</p><h2>Good work can find you, too.</h2><p>Save roles, follow companies and keep every application in one calm place.</p><button className="button button-light" onClick={() => navigate('/login?mode=register')}>Create your free profile <ArrowRight size={17}/></button></div>
      <div className="phone"><div className="phone-top"></div><p>Good morning, Alex</p><h4>3 fresh matches</h4><div className="phone-job"><span>PL</span><div><strong>Product Designer</strong><small>Paperplane · Remote</small></div></div><div className="phone-job"><span>NS</span><div><strong>UX Researcher</strong><small>Northstar · Hybrid</small></div></div></div>
    </div></section>
    <section className="employer-cta"><div className="container"><div><p className="kicker">Hiring thoughtful people?</p><h2>Share the work that matters.</h2><p>Reach candidates who care about fit, purpose and doing good work.</p></div><div><button className="button">Post a job</button><button className="button button-outline">Talk to our team</button></div><Building2 size={120}/></div></section>
  </>
}

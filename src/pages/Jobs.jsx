import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Filter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import JobCard from '../components/JobCard'
import { getJobs } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Jobs() {
  const location = useLocation(), navigate = useNavigate(), { user } = useAuth()
  const initial = new URLSearchParams(location.search).get('search') || ''
  const [search, setSearch] = useState(initial), [jobs, setJobs] = useState([]), [selected, setSelected] = useState(null)
  useEffect(() => { getJobs(search ? `?search=${encodeURIComponent(search)}` : '').then(setJobs) }, [location.search])
  const apply = job => user ? navigate('/dashboard', { state: { applyTo: job } }) : navigate('/login')
  return <section className="jobs-page"><div className="jobs-hero"><div className="container"><p className="kicker">Open roles</p><h1>Find work worth doing.</h1><form onSubmit={e => { e.preventDefault(); navigate(`/jobs?search=${encodeURIComponent(search)}`) }}><label><Search/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title, skill or company"/></label><label><MapPin/><input placeholder="Location or remote"/></label><button className="button">Search</button></form></div></div><div className="container jobs-layout"><aside className="filters"><h3><SlidersHorizontal/> Filters</h3>{['Date posted','Experience level','Workplace','Job type','Salary range'].map((filter, i) => <div className="filter-group" key={filter}><strong>{filter}</strong>{(i === 0 ? ['Any time','Past week','Past 24 hours'] : i === 2 ? ['Remote','Hybrid','On-site'] : ['All','Entry level','Mid level']).map(x => <label key={x}><input type="checkbox"/> {x}</label>)}</div>)}</aside><div className="results"><div className="results-top"><div><h2>{jobs.length} thoughtful opportunities</h2><p>Roles matching your search and preferences.</p></div><button className="filter-mobile"><Filter/> Filters</button><select><option>Most relevant</option><option>Newest</option><option>Salary: high to low</option></select></div>{search && <div className="active-filter">{search}<button onClick={() => { setSearch(''); navigate('/jobs') }}><X size={14}/></button></div>}<div className="jobs-list">{jobs.map(job => <JobCard key={job.id} job={job} onApply={apply} compact/>)}</div></div></div></section>
}

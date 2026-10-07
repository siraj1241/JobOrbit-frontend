import { ArrowUpRight, Bookmark, MapPin } from 'lucide-react'

export default function JobCard({ job, onApply, compact = false }) {
  return <article className={`job-card ${compact ? 'compact' : ''}`}>
    <div className="job-card-top">
      <span className="company-logo" style={{ background: job.color }}>{job.initials}</span>
      <button className="save-button" aria-label="Save job"><Bookmark size={18}/></button>
    </div>
    <p className="eyebrow">{job.company}</p>
    <h3>{job.title}</h3>
    <p className="job-location"><MapPin size={14}/>{job.location}</p>
    <div className="tag-row"><span>{job.type}</span><span>{job.mode}</span></div>
    <div className="job-card-bottom"><strong>{job.salary}</strong>{onApply ? <button onClick={() => onApply(job)}>Apply <ArrowUpRight size={15}/></button> : <span>{job.posted}</span>}</div>
  </article>
}

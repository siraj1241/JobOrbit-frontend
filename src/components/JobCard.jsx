import { ArrowUpRight, Bookmark, MapPin } from 'lucide-react';

/**
 * JobCard — presentational component for a job listing.
 *
 * Accepts either a raw backend JobDto or a job that has already been passed
 * through `toJobCardProps()` (which adds `company`, `initials`, `color`,
 * `type`, `mode`, `posted`, `salary`). Either way it renders cleanly.
 *
 * @param {object}  props
 * @param {object}  props.job      The job object (raw or mapped).
 * @param {Function} [props.onApply]  If provided, the Apply button calls this with the job.
 * @param {boolean} [props.compact=false]  Use the compact list-row layout.
 */
export default function JobCard({ job, onApply, compact = false }) {
  const company = job.company ?? job.companyName ?? '';
  const title = job.title ?? '';
  const location = job.location ?? '';
  const initials = job.initials ?? '?';
  const color = job.color ?? '#eee';
  const type = job.type ?? (job.jobTypes?.[0] ?? 'Full time');
  const mode = job.mode ?? (job.remote ? 'Remote' : 'On-site');
  const salary = job.salary ?? (job.tags?.length ? job.tags.slice(0, 3).join(' · ') : '—');
  const posted = job.posted ?? '';

  return (
    <article className={`job-card ${compact ? 'compact' : ''}`}>
      <div className="job-card-top">
        <span className="company-logo" style={{ background: color, color: 'white' }}>{initials}</span>
        <button className="save-button" aria-label="Save job"><Bookmark size={18} /></button>
      </div>
      <p className="eyebrow">{company}</p>
      <h3>{title}</h3>
      <p className="job-location"><MapPin size={14} /> {location}</p>
      <div className="tag-row">
        <span>{type}</span>
        <span>{mode}</span>
      </div>
      <div className="job-card-bottom">
        <strong>{salary}</strong>
        {onApply
          ? <button onClick={() => onApply(job)}>Apply <ArrowUpRight size={15} /></button>
          : posted && <span>{posted}</span>}
      </div>
    </article>
  );
}

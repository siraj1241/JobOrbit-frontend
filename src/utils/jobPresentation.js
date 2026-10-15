/**
 * Pure presentation helpers for Job objects returned by the backend.
 *
 * Backend Job shape:
 *   { id, externalId, source, title, companyName, description, location,
 *     remote, tags: string[], jobTypes: string[], url, publishedAt, cachedAt }
 *
 * These helpers translate that into the fields the UI components want
 * (initials, color, formatted salary, "time ago", etc.) without
 * spreading that knowledge across every component.
 */

const PALETTE = [
  '#dff4ef', '#edf0ff', '#fff0e7', '#e9f7e8',
  '#e8f5fb', '#f4edff', '#ffe8f1', '#fffae0',
];

/**
 * Derive a stable 2-letter brand initial from a company name.
 *   "Acme Corp"   → "AC"
 *   "Northstar"   → "NO"
 *   "O"           → "O"
 */
export function companyInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Pick a stable background color from the palette based on the company name. */
export function companyColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/**
 * Format a backend Job into the shape the JobCard component expects.
 * Adds derived fields (initials, color, type, mode, posted, salary)
 * while keeping the original fields intact.
 */
export function toJobCardProps(job) {
  if (!job) return null;
  return {
    ...job,
    id: job.id || job.externalId,
    company: job.companyName,
    initials: companyInitials(job.companyName),
    color: companyColor(job.companyName),
    type: job.jobTypes?.[0] || 'Full time',
    mode: job.remote ? 'Remote' : 'On-site',
    salary: job.tags?.slice(0, 3).join(' · ') || '—',
    posted: formatTimeAgo(job.publishedAt),
  };
}

/** Format an ISO date string as a short "time ago" label. */
export function formatTimeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const day = 86400000;
  if (diff < day) return 'Today';
  if (diff < 2 * day) return 'Yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 14 * day) return '1 week ago';
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} weeks ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Build the JobCard props list from a backend paged response,
 * returning the paged envelope with `items` already mapped.
 */
export function mapPagedJobs(paged = { items: [] }) {
  return {
    ...paged,
    items: (paged.items || []).map(toJobCardProps),
  };
}

/** Returns true if the given object looks like a backend JobDto. */
export function isJobDto(obj) {
  return !!obj && typeof obj.title === 'string' && typeof obj.companyName === 'string';
}

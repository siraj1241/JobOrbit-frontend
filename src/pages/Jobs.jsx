import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import JobCard from '../components/JobCard';
import { getExternalJobs, searchJobs } from '../services/jobsService';
import { mapPagedJobs, toJobCardProps } from '../utils/jobPresentation';
import { useAuth } from '../hooks/useAuth';

const PAGE_SIZE = 20;

/**
 * Jobs page — fetches jobs from the backend.
 * Default source: live external provider (Arbeitnow). User can toggle to the
 * local cache ("Saved in DB") which only has jobs after a sync has been run.
 */
export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const search = searchParams.get('search') || '';
  const location = searchParams.get('location') || '';
  const remote = searchParams.get('remote') === 'true' ? true : null;
  const source = searchParams.get('source') === 'cache' ? 'cache' : 'external';

  const [searchInput, setSearchInput] = useState(search);
  const [locationInput, setLocationInput] = useState(location);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { search, location, remote, page: 1, pageSize: PAGE_SIZE };
      const paged = source === 'cache'
        ? await searchJobs(params)
        : await getExternalJobs(params);
      const mapped = mapPagedJobs(paged);
      setJobs(mapped.items);
      setTotalItems(mapped.totalItems);
    } catch (err) {
      setError(err.message || 'Failed to load jobs.');
      setJobs([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [search, location, remote, source]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput) next.set('search', searchInput); else next.delete('search');
    if (locationInput) next.set('location', locationInput); else next.delete('location');
    setSearchParams(next);
  };

  const clearSearch = () => {
    setSearchInput('');
    setLocationInput('');
    setSearchParams(new URLSearchParams());
  };

  const toggleSource = () => {
    const next = new URLSearchParams(searchParams);
    next.set('source', source === 'external' ? 'cache' : 'external');
    setSearchParams(next);
  };

  const handleApply = (job) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/jobs' } });
      return;
    }
    // Application flow not yet in backend — surface the external URL for now.
    if (job.url) window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="jobs-page">
      <div className="jobs-hero">
        <div className="container">
          <p className="kicker">Open roles</p>
          <h1>Find work worth doing.</h1>
          <form onSubmit={handleSearch}>
            <label>
              <Search />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Job title, skill or company"
              />
            </label>
            <label>
              <MapPin />
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Location or remote"
              />
            </label>
            <button className="button">Search</button>
          </form>
        </div>
      </div>

      <div className="container jobs-layout">
        <aside className="filters">
          <h3><SlidersHorizontal /> Source</h3>
          <button
            className={`source-toggle ${source === 'external' ? 'active' : ''}`}
            onClick={toggleSource}
          >
            {source === 'external' ? 'Live jobs (Arbeitnow)' : 'Switch to live jobs'}
          </button>
          <p className="filter-hint">
            {source === 'external'
              ? 'Fetched live from the Arbeitnow public board.'
              : 'Showing jobs synced into the JobOrbit database.'}
          </p>
        </aside>

        <div className="results">
          <div className="results-top">
            <div>
              <h2>{loading ? 'Loading…' : `${totalItems} thoughtful opportunities`}</h2>
              <p>{source === 'external' ? 'Live from Arbeitnow.' : 'From the local cache.'}</p>
            </div>
            <button className="filter-mobile"><Filter /> Filters</button>
          </div>

          {(search || location || remote) && (
            <div className="active-filter">
              {search && <span>{search}</span>}
              {location && <span>{location}</span>}
              {remote && <span>Remote only</span>}
              <button onClick={clearSearch}><X size={14} /></button>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="jobs-list">
            {loading ? (
              <p>Loading jobs…</p>
            ) : jobs.length === 0 ? (
              <p>No jobs found. Try a different search or switch sources.</p>
            ) : (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={handleApply} compact />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

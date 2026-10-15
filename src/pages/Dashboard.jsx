import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, RefreshCw, Search, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getJobsWithFallback, syncJobs } from '../services/jobsService';
import { mapPagedJobs } from '../utils/jobPresentation';
import JobCard from '../components/JobCard';
import { ApiError } from '../lib/api';
import { useEffect } from 'react';

/**
 * Authenticated dashboard.
 *
 * Replaces the old mock-applications flow with a real backend integration:
 *   - Shows logged-in user info (from /account/me via useAuth)
 *   - Lets the user trigger a sync from Arbeitnow into the local DB
 *   - Surfaces the latest jobs from the external provider as recommendations
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [notice, setNotice] = useState('');

  // Load latest external jobs to show as "Fresh matches".
  const loadJobs = useCallback(async () => {
    try {
      const paged = await getJobsWithFallback({ page: 1, pageSize: 3 });
      setJobs(mapPagedJobs(paged).items);
    } catch {
      setJobs([]);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleSync = async () => {
    setSyncing(true);
    setNotice('');
    setSyncResult(null);
    try {
      const result = await syncJobs(2);
      setSyncResult(result);
      setNotice(`Sync complete: ${result.added} new + ${result.updated} updated jobs.`);
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dash-welcome">
          <div>
            <p className="kicker">Your workspace</p>
            <h1>Good morning, {firstName}.</h1>
            <p>Keep your search focused and your next steps clear.</p>
          </div>
          <button className="button" onClick={() => navigate('/jobs')}>
            <Search /> Find more jobs
          </button>
        </div>

        {notice && (
          <div className="notice">
            <CheckCircle2 /> {notice}
            {syncResult && (
              <small>
                &nbsp;({syncResult.fetched} fetched · {syncResult.skipped} unchanged)
              </small>
            )}
          </div>
        )}

        <div className="dash-stats">
          <article>
            <BriefcaseBusiness />
            <span><strong>{user?.role || '—'}</strong>Account role</span>
          </article>
          <article>
            <Clock3 />
            <span><strong>{user?.email}</strong>Logged in as</span>
          </article>
          <article>
            <Zap />
            <span><strong>{jobs.length}</strong>Fresh matches</span>
          </article>
        </div>

        <div className="application-panel">
          <div className="panel-heading">
            <div>
              <h2>Refresh the job cache</h2>
              <p>Pull the latest listings from Arbeitnow into the JobOrbit database.</p>
            </div>
            <button
              className="button"
              onClick={handleSync}
              disabled={syncing}
              title="Sync from Arbeitnow"
            >
              <RefreshCw size={16} className={syncing ? 'spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync jobs'}
            </button>
          </div>

          <div className="job-grid">
            {jobs.length === 0
              ? <p>No jobs loaded yet. Try syncing now.</p>
              : jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={(j) => j.url && window.open(j.url, '_blank', 'noopener,noreferrer')}
                />
              ))}
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button className="link-arrow" onClick={() => navigate('/jobs')}>
              Browse all jobs <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

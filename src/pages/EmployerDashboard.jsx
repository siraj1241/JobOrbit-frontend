import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness, Building2, CheckCircle2, Edit3, Plus, Rocket, Trash2, X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as employerService from '../services/employerService';
import { ApiError } from '../lib/api';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const STATUSES = ['Draft', 'Published', 'Closed'];
const EMPTY_FORM = {
  title: '', description: '', location: '', remote: false,
  employmentType: 'Full-time',
  salaryMin: '', salaryMax: '', salaryCurrency: 'USD',
  tagsCsv: '', applicationUrl: '', applicationInstructions: '',
  applicationDeadline: '', status: 'Draft',
};

/**
 * Employer dashboard. If the user is not yet an Employer, shows a one-step
 * "Upgrade" card. Once upgraded, shows:
 *   - The list of the employer's job postings (with edit / delete buttons)
 *   - A "Create new posting" button → opens a modal form
 *   - An inline edit form when editing an existing posting
 */
export default function EmployerDashboard() {
  const { user, isEmployer, upgradeToEmployer } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Upgrade flow state
  const [companyName, setCompanyName] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  // Form modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await employerService.listMyJobs();
      setJobs(list);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isEmployer) loadJobs();
    else setLoading(false);
  }, [isEmployer, loadJobs]);

  // ── Upgrade flow ──────────────────────────────────────
  const handleUpgrade = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setUpgrading(true);
    setError('');
    try {
      await upgradeToEmployer(companyName.trim());
      setNotice('Welcome! Your account is now an Employer account.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upgrade failed.');
    } finally {
      setUpgrading(false);
    }
  };

  // ── Job form ──────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (job) => {
    setEditingId(job.id);
    setForm({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      remote: !!job.remote,
      employmentType: job.employmentType || 'Full-time',
      salaryMin: job.salaryMin ?? '',
      salaryMax: job.salaryMax ?? '',
      salaryCurrency: job.salaryCurrency || 'USD',
      tagsCsv: (job.tags || []).join(', '),
      applicationUrl: job.applicationUrl || '',
      applicationInstructions: job.applicationInstructions || '',
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.slice(0, 10) : '',
      status: job.status || 'Draft',
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin === '' ? null : Number(form.salaryMin),
        salaryMax: form.salaryMax === '' ? null : Number(form.salaryMax),
        applicationDeadline: form.applicationDeadline
          ? new Date(form.applicationDeadline).toISOString()
          : null,
      };
      if (editingId) {
        await employerService.updateJob(editingId, payload);
        setNotice(`Updated "${form.title}".`);
      } else {
        await employerService.createJob(payload);
        setNotice(`Created "${form.title}" as ${form.status}.`);
      }
      setFormOpen(false);
      await loadJobs();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await employerService.deleteJob(job.id);
      setNotice(`Deleted "${job.title}".`);
      await loadJobs();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  // ── Not an employer yet → show upgrade UI ─────────────
  if (!isEmployer) {
    return (
      <section className="dashboard">
        <div className="container">
          <div className="dash-welcome">
            <div>
              <p className="kicker">Become an employer</p>
              <h1>Post jobs on JobOrbit</h1>
              <p>Upgrade your account to publish jobs directly to our community of seekers.</p>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
          {notice && <div className="notice"><CheckCircle2 /> {notice}</div>}

          <div className="application-panel" style={{ maxWidth: 560, marginTop: 30 }}>
            <h2><Building2 size={20} /> Upgrade to Employer</h2>
            <p>Tell us your company name. You can post jobs immediately after upgrading.</p>
            <form onSubmit={handleUpgrade} className="auth-form" style={{ marginTop: 16 }}>
              <label>
                Company name
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Acme Corp"
                />
              </label>
              <button className="button" disabled={upgrading}>
                {upgrading ? 'Upgrading…' : 'Upgrade my account'} <Rocket size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  // ── Employer dashboard ────────────────────────────────
  return (
    <section className="dashboard">
      <div className="container">
        <div className="dash-welcome">
          <div>
            <p className="kicker">Employer workspace</p>
            <h1>Welcome, {user?.companyName || user?.displayName}.</h1>
            <p>Manage your job postings and reach thousands of seekers.</p>
          </div>
          <button className="button" onClick={openCreate}>
            <Plus size={16} /> Post a job
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {notice && <div className="notice"><CheckCircle2 /> {notice}</div>}

        <div className="dash-stats">
          <article>
            <BriefcaseBusiness />
            <span><strong>{jobs.length}</strong> Total postings</span>
          </article>
          <article>
            <Rocket />
            <span><strong>{jobs.filter(j => j.status === 'Published').length}</strong> Published</span>
          </article>
          <article>
            <Edit3 />
            <span><strong>{jobs.filter(j => j.status === 'Draft').length}</strong> Drafts</span>
          </article>
        </div>

        <div className="application-panel">
          <div className="panel-heading">
            <div>
              <h2>Your job postings</h2>
              <p>Everything you've posted, in one place.</p>
            </div>
          </div>

          <div className="application-table">
            <div className="table-row table-head">
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
              <span></span>
            </div>

            {loading ? (
              <p style={{ padding: 20 }}>Loading…</p>
            ) : jobs.length === 0 ? (
              <p style={{ padding: 20 }}>No postings yet. Click "Post a job" to create your first one.</p>
            ) : (
              jobs.map(job => (
                <div className="table-row" key={job.id}>
                  <span className="application-role">
                    <i style={{ background: '#dff4ef' }}>{job.title?.[0]?.toUpperCase() || 'J'}</i>
                    <span>
                      <strong>{job.title}</strong>
                      <small>{job.location} · {job.employmentType}</small>
                    </span>
                  </span>
                  <span>
                    <b className={`status ${(job.status || '').toLowerCase()}`}>{job.status}</b>
                  </span>
                  <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(job)} title="Edit"><Edit3 size={15} /></button>
                    <button onClick={() => handleDelete(job)} title="Delete"><Trash2 size={15} /></button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Job form modal ─── */}
      {formOpen && (
        <div className="modal-backdrop" onClick={() => setFormOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit posting' : 'New job posting'}</h2>
              <button className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close"><X /></button>
            </div>

            <form onSubmit={handleSave} className="job-form">
              <label>Title*
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior React Developer" />
              </label>

              <label>Description*
                <textarea required rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, requirements…" />
              </label>

              <div className="form-row">
                <label>Location*
                  <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
                </label>
                <label>Employment type
                  <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              </div>

              <label className="checkbox-row">
                <input type="checkbox" checked={form.remote} onChange={e => setForm({ ...form, remote: e.target.checked })} />
                Remote position
              </label>

              <div className="form-row">
                <label>Salary min
                  <input type="number" min="0" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} placeholder="120000" />
                </label>
                <label>Salary max
                  <input type="number" min="0" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} placeholder="160000" />
                </label>
                <label>Currency
                  <input maxLength={3} value={form.salaryCurrency} onChange={e => setForm({ ...form, salaryCurrency: e.target.value.toUpperCase() })} placeholder="USD" />
                </label>
              </div>

              <label>Skills / tags (comma-separated)
                <input value={form.tagsCsv} onChange={e => setForm({ ...form, tagsCsv: e.target.value })} placeholder="react,typescript,aws" />
              </label>

              <label>Application URL
                <input type="url" value={form.applicationUrl} onChange={e => setForm({ ...form, applicationUrl: e.target.value })} placeholder="https://acme.example.com/apply/123" />
              </label>

              <label>Application instructions
                <textarea rows={2} value={form.applicationInstructions} onChange={e => setForm({ ...form, applicationInstructions: e.target.value })} placeholder="Optional: any extra instructions to applicants." />
              </label>

              <div className="form-row">
                <label>Application deadline
                  <input type="date" value={form.applicationDeadline} onChange={e => setForm({ ...form, applicationDeadline: e.target.value })} />
                </label>
                <label>Status
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="button button-outline" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="button" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

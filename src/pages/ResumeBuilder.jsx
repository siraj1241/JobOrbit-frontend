import { useCallback, useEffect, useState } from 'react';
import { BriefcaseBusiness, Plus, Sparkles, Trash2, X, Save, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as resumeService from '../services/resumeService';
import { ApiError } from '../lib/api';

const EMPTY_RESUME = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

const EMPTY_EXP = { company: '', title: '', startDate: '', endDate: '', current: false, location: '', bulletPoints: [] };

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [resume, setResume] = useState(EMPTY_RESUME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // AI generator state
  const [aiCompany, setAiCompany] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiJobDesc, setAiJobDesc] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadResume = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resumeService.getMyResume();
      if (data) {
        setResume({
          fullName: data.fullName || '',
          headline: data.headline || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          summary: data.summary || '',
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
        });
      } else {
        // prefill from user
        setResume({
          ...EMPTY_RESUME,
          fullName: user?.displayName || '',
          email: user?.email || '',
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load resume.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadResume(); }, [loadResume]);

  // ── Save ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...resume,
        experience: resume.experience.map(x => ({
          ...x,
          startDate: x.startDate ? new Date(x.startDate).toISOString() : new Date().toISOString(),
          endDate: x.endDate ? new Date(x.endDate).toISOString() : null,
        })),
        education: resume.education.map(ed => ({
          ...ed,
          startDate: ed.startDate ? new Date(ed.startDate).toISOString() : null,
          endDate: ed.endDate ? new Date(ed.endDate).toISOString() : null,
        })),
      };
      await resumeService.upsertResume(payload);
      setNotice('Resume saved.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── AI bullet generator ──
  const handleGenerate = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setError('');
    setAiResult(null);
    try {
      const result = await resumeService.generateBullets({
        company: aiCompany,
        title: aiTitle,
        existingSummary: resume.summary,
        jobDescription: aiJobDesc || null,
      });
      setAiResult(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyBullets = () => {
    if (!aiResult) return;
    setResume(r => ({
      ...r,
      summary: aiResult.summarySuggestion || r.summary,
      experience: [
        ...r.experience,
        {
          company: aiResult.company,
          title: aiResult.title,
          startDate: new Date().toISOString(),
          endDate: null,
          current: false,
          location: '',
          bulletPoints: [...aiResult.bulletPoints],
        },
      ],
    }));
    setNotice('Bullets added to your experience section. Review and save.');
    setAiResult(null);
  };

  // ── Experience / education / skills editing ──
  const addExperience = () => setResume(r => ({ ...r, experience: [...r.experience, { ...EMPTY_EXP }] }));
  const updateExperience = (i, patch) => setResume(r => ({
    ...r,
    experience: r.experience.map((x, idx) => idx === i ? { ...x, ...patch } : x),
  }));
  const removeExperience = (i) => setResume(r => ({ ...r, experience: r.experience.filter((_, idx) => idx !== i) }));

  const addEducation = () => setResume(r => ({ ...r, education: [...r.education, { institution: '', degree: '', startDate: '', endDate: '', field: '' }] }));
  const updateEducation = (i, patch) => setResume(r => ({
    ...r,
    education: r.education.map((x, idx) => idx === i ? { ...x, ...patch } : x),
  }));
  const removeEducation = (i) => setResume(r => ({ ...r, education: r.education.filter((_, idx) => idx !== i) }));

  const addSkill = () => setResume(r => ({ ...r, skills: [...r.skills, ''] }));
  const updateSkill = (i, val) => setResume(r => ({ ...r, skills: r.skills.map((s, idx) => idx === i ? val : s) }));
  const removeSkill = (i) => setResume(r => ({ ...r, skills: r.skills.filter((_, idx) => idx !== i) }));

  if (loading) return <section className="dashboard"><div className="container"><p>Loading…</p></div></section>;

  return (
    <section className="dashboard">
      <div className="container">
        <div className="dash-welcome">
          <div>
            <p className="kicker">Resume builder</p>
            <h1>Build your resume</h1>
            <p>Keep one resume on file. Use AI to generate tailored bullet points for any role.</p>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {notice && <div className="notice"><Sparkles size={16} /> {notice}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 30 }}>
          {/* ─── Editor ─── */}
          <form onSubmit={handleSave} className="application-panel" style={{ padding: 24 }}>
            <h2><FileText size={18} /> Resume details</h2>

            <label>Full name*
              <input required value={resume.fullName} onChange={e => setResume({ ...resume, fullName: e.target.value })} />
            </label>
            <label>Headline*
              <input required value={resume.headline} onChange={e => setResume({ ...resume, headline: e.target.value })} placeholder="Senior Frontend Engineer" />
            </label>

            <div className="form-row">
              <label>Email
                <input type="email" value={resume.email} onChange={e => setResume({ ...resume, email: e.target.value })} />
              </label>
              <label>Phone
                <input value={resume.phone} onChange={e => setResume({ ...resume, phone: e.target.value })} />
              </label>
            </div>
            <label>Location
              <input value={resume.location} onChange={e => setResume({ ...resume, location: e.target.value })} />
            </label>
            <label>Professional summary
              <textarea rows={3} value={resume.summary} onChange={e => setResume({ ...resume, summary: e.target.value })} />
            </label>

            <h3 style={{ marginTop: 24 }}>Experience</h3>
            {resume.experience.map((exp, i) => (
              <div key={i} className="card-inset">
                <div className="form-row">
                  <input placeholder="Company" value={exp.company} onChange={e => updateExperience(i, { company: e.target.value })} />
                  <input placeholder="Title" value={exp.title} onChange={e => updateExperience(i, { title: e.target.value })} />
                </div>
                <div className="form-row">
                  <input type="month" value={exp.startDate?.slice(0, 7) || ''} onChange={e => updateExperience(i, { startDate: e.target.value })} placeholder="Start" />
                  <input type="month" value={exp.endDate?.slice(0, 7) || ''} onChange={e => updateExperience(i, { endDate: e.target.value })} placeholder="End" />
                  <label className="checkbox-row">
                    <input type="checkbox" checked={exp.current} onChange={e => updateExperience(i, { current: e.target.checked })} /> Current
                  </label>
                </div>
                <textarea rows={4} placeholder="Bullet points (one per line)" value={(exp.bulletPoints || []).join('\n')}
                  onChange={e => updateExperience(i, { bulletPoints: e.target.value.split('\n').filter(l => l.trim()) })} />
                <button type="button" className="text-button" onClick={() => removeExperience(i)}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
            <button type="button" className="button button-outline" onClick={addExperience}><Plus size={14} /> Add experience</button>

            <h3 style={{ marginTop: 24 }}>Education</h3>
            {resume.education.map((ed, i) => (
              <div key={i} className="card-inset">
                <div className="form-row">
                  <input placeholder="Institution" value={ed.institution} onChange={e => updateEducation(i, { institution: e.target.value })} />
                  <input placeholder="Degree" value={ed.degree} onChange={e => updateEducation(i, { degree: e.target.value })} />
                </div>
                <div className="form-row">
                  <input placeholder="Field" value={ed.field || ''} onChange={e => updateEducation(i, { field: e.target.value })} />
                  <input type="month" value={ed.startDate?.slice(0, 7) || ''} onChange={e => updateEducation(i, { startDate: e.target.value })} placeholder="Start" />
                  <input type="month" value={ed.endDate?.slice(0, 7) || ''} onChange={e => updateEducation(i, { endDate: e.target.value })} placeholder="End" />
                </div>
                <button type="button" className="text-button" onClick={() => removeEducation(i)}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
            <button type="button" className="button button-outline" onClick={addEducation}><Plus size={14} /> Add education</button>

            <h3 style={{ marginTop: 24 }}>Skills</h3>
            <div className="skills-list">
              {resume.skills.map((s, i) => (
                <div key={i} className="skill-row">
                  <input value={s} onChange={e => updateSkill(i, e.target.value)} placeholder="React" />
                  <button type="button" className="icon-button" onClick={() => removeSkill(i)}><X size={14} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="button button-outline" onClick={addSkill}><Plus size={14} /> Add skill</button>

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button type="submit" className="button" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving…' : 'Save resume'}
              </button>
            </div>
          </form>

          {/* ─── AI assistant ─── */}
          <div className="application-panel" style={{ padding: 24, alignSelf: 'flex-start' }}>
            <h2><Sparkles size={18} /> AI bullet generator</h2>
            <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
              Generate 5 tailored bullet points + a summary suggestion for any role.
              Requires OpenAI API key on the backend.
            </p>
            <form onSubmit={handleGenerate} className="auth-form">
              <label>Target company*
                <input required value={aiCompany} onChange={e => setAiCompany(e.target.value)} placeholder="Google" />
              </label>
              <label>Target title*
                <input required value={aiTitle} onChange={e => setAiTitle(e.target.value)} placeholder="Staff Frontend Engineer" />
              </label>
              <label>Job description (optional — for tailoring)
                <textarea rows={5} value={aiJobDesc} onChange={e => setAiJobDesc(e.target.value)} placeholder="Paste the job description here for tailored bullets." />
              </label>
              <button className="button" disabled={aiLoading} type="submit">
                {aiLoading ? 'Generating…' : 'Generate bullets'} <Sparkles size={15} />
              </button>
            </form>

            {aiResult && (
              <div className="card-inset" style={{ marginTop: 20 }}>
                <h4>Suggested summary</h4>
                <p style={{ fontSize: 13 }}>{aiResult.summarySuggestion || '—'}</p>
                <h4 style={{ marginTop: 12 }}>Bullet points</h4>
                <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                  {aiResult.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
                <button className="button" onClick={applyBullets}>
                  <Plus size={14} /> Add to my resume
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

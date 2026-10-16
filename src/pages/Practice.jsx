import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Code2, Database, Lightbulb, Loader2, Play, RefreshCw, Sparkles, XCircle, Zap, ChevronRight } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import BigOVisualizer from '../components/BigOVisualizer';
import * as practiceService from '../services/practiceService';
import { ApiError } from '../lib/api';
import './Practice.css';

const TABS = [
  { id: 'sql', label: 'SQL Puzzles', icon: Database, color: '#6366f1' },
  { id: 'algo', label: 'Algorithms', icon: Code2, color: '#06b6d4' },
  { id: 'mcq', label: 'Quick Quiz', icon: Zap, color: '#f59e0b' },
];

export default function Practice() {
  const [tab, setTab] = useState('sql');

  return (
    <section className="practice-page">
      <div className="container">
        {/* Hero */}
        <div className="practice-hero">
          <div className="practice-orbs">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
          <div className="practice-hero-content">
            <p className="kicker kicker-light"><Sparkles size={14} /> Sharpen your skills</p>
            <h1>Practice. Analyze.<br /><em>Level up.</em></h1>
            <p>Solve real-world SQL puzzles, algorithms with live Big-O analysis, and quick quizzes — designed to feel smooth and rewarding.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="practice-tabs">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                className={`practice-tab ${isActive ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                style={isActive ? { '--tab-color': t.color } : {}}
              >
                <Icon size={16} />
                <span>{t.label}</span>
                {isActive && <span className="tab-glow" style={{ background: t.color }} />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="practice-content" key={tab}>
          {tab === 'sql' && <SqlSection />}
          {tab === 'algo' && <AlgoSection />}
          {tab === 'mcq' && <McqSection />}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════
//  SQL section
// ═════════════════════════════════════════════════════════════════
function SqlSection() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    practiceService.listSqlPuzzles()
      .then((data) => {
        setPuzzles(data);
        setActiveId(data[0]?.id ?? null);
        setCode('');
      })
      .catch((err) => setError(err.message || 'Failed to load puzzles'))
      .finally(() => setLoading(false));
  }, []);

  const active = puzzles.find((p) => p.id === activeId);

  const handleCheck = async () => {
    if (!active) return;
    setChecking(true);
    setResult(null);
    setError('');
    try {
      const r = await practiceService.checkSql(active.id, code);
      setResult(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Check failed.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <div className="practice-loading"><Loader2 className="spin" size={24} /> Loading puzzles…</div>;
  if (error && puzzles.length === 0) return <div className="practice-error">{error}</div>;

  return (
    <div className="puzzle-grid">
      {/* Left: puzzle list */}
      <aside className="puzzle-list">
        <h3>SQL Puzzles</h3>
        {puzzles.map((p) => (
          <button
            key={p.id}
            className={`puzzle-list-item ${activeId === p.id ? 'active' : ''}`}
            onClick={() => { setActiveId(p.id); setCode(''); setResult(null); setShowSolution(false); }}
          >
            <div className="pli-top">
              <span className={`difficulty difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              <ChevronRight size={14} className="pli-arrow" />
            </div>
            <div className="pli-title">{p.title}</div>
          </button>
        ))}
      </aside>

      {/* Right: puzzle editor */}
      <div className="puzzle-detail">
        {active && (
          <>
            <div className="puzzle-detail-header">
              <div>
                <h2>{active.title}</h2>
                <span className={`difficulty difficulty-${active.difficulty.toLowerCase()}`}>{active.difficulty}</span>
              </div>
            </div>

            <p className="puzzle-description">{active.description}</p>

            <div className="puzzle-schema">
              <h4><Database size={14} /> Schema</h4>
              <pre>{active.schema}</pre>
            </div>

            <div className="puzzle-hints">
              <h4><Lightbulb size={14} /> Hints</h4>
              <ul>
                {active.hints.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>

            <div className="puzzle-editor-block">
              <h4>Write your SQL query</h4>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="sql"
                placeholder="-- SELECT * FROM employees ..."
                minHeight={160}
              />
            </div>

            <div className="puzzle-actions">
              <button className="button" onClick={handleCheck} disabled={checking || !code.trim()}>
                {checking ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
                {checking ? 'Checking…' : 'Run & Check'}
              </button>
              <button className="button button-outline" onClick={() => setShowSolution(s => !s)}>
                {showSolution ? 'Hide solution' : 'Show solution'}
              </button>
              <button className="text-button" onClick={() => { setCode(''); setResult(null); }}>
                <RefreshCw size={14} /> Clear
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            {result && (
              <div className={`puzzle-result ${result.passed ? 'pass' : 'fail'}`}>
                <div className="result-header">
                  {result.passed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  <h4>{result.passed ? 'Correct!' : 'Not quite there'}</h4>
                </div>
                <p>{result.feedback}</p>
                <div className="result-keywords">
                  {result.foundKeywords.map((k) => (
                    <span key={k} className="keyword-chip pass">{k}</span>
                  ))}
                  {result.missingKeywords.map((k) => (
                    <span key={k} className="keyword-chip fail">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {showSolution && (
              <div className="puzzle-solution">
                <h4>Sample solution</h4>
                <pre>{active.sampleSolution}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
//  Algorithm section
// ═════════════════════════════════════════════════════════════════
function AlgoSection() {
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    practiceService.listAlgorithms()
      .then((data) => {
        setPuzzles(data);
        setActiveId(data[0]?.id ?? null);
        setCode(data[0]?.signature ?? '');
      })
      .catch((err) => setError(err.message || 'Failed to load puzzles'))
      .finally(() => setLoading(false));
  }, []);

  const active = puzzles.find((p) => p.id === activeId);

  // When user selects a different puzzle, prefill with its signature
  const handleSelect = (p) => {
    setActiveId(p.id);
    setCode(p.signature);
    setResult(null);
    setShowSolution(false);
  };

  const handleAnalyze = async () => {
    if (!active) return;
    setAnalyzing(true);
    setResult(null);
    setError('');
    try {
      const r = await practiceService.analyzeAlgorithm(active.id, code);
      setResult(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="practice-loading"><Loader2 className="spin" size={24} /> Loading puzzles…</div>;

  return (
    <div className="puzzle-grid">
      <aside className="puzzle-list">
        <h3>Algorithms</h3>
        {puzzles.map((p) => (
          <button
            key={p.id}
            className={`puzzle-list-item ${activeId === p.id ? 'active' : ''}`}
            onClick={() => handleSelect(p)}
          >
            <div className="pli-top">
              <span className={`difficulty difficulty-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
              <span className="pli-complexity">{p.optimalComplexity}</span>
            </div>
            <div className="pli-title">{p.title}</div>
          </button>
        ))}
      </aside>

      <div className="puzzle-detail">
        {active && (
          <>
            <div className="puzzle-detail-header">
              <div>
                <h2>{active.title}</h2>
                <span className={`difficulty difficulty-${active.difficulty.toLowerCase()}`}>{active.difficulty}</span>
                <span className="optimal-badge">Optimal: {active.optimalComplexity}</span>
              </div>
            </div>

            <p className="puzzle-description">{active.description}</p>

            <div className="puzzle-hints">
              <h4><Lightbulb size={14} /> Hints</h4>
              <ul>
                {active.hints.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>

            <div className="puzzle-editor-block">
              <h4>Write your solution</h4>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="javascript"
                placeholder="// function twoSum(nums, target) { ... }"
                minHeight={220}
              />
            </div>

            <div className="puzzle-actions">
              <button className="button" onClick={handleAnalyze} disabled={analyzing || !code.trim()}>
                {analyzing ? <Loader2 size={16} className="spin" /> : <Zap size={16} />}
                {analyzing ? 'Analyzing…' : 'Analyze complexity'}
              </button>
              <button className="button button-outline" onClick={() => setShowSolution(s => !s)}>
                {showSolution ? 'Hide solution' : 'Show solution'}
              </button>
              <button className="text-button" onClick={() => { setCode(active.signature); setResult(null); }}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            {result && (
              <div className={`puzzle-result ${result.isOptimal ? 'pass' : 'warn'}`}>
                <div className="result-header">
                  {result.isOptimal ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                  <h4>{result.isOptimal ? 'Optimal solution!' : 'Solution works but could be faster'}</h4>
                </div>
                <p>{result.feedback}</p>
                <ul className="result-reasons">
                  {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                <div style={{ marginTop: 16 }}>
                  <BigOVisualizer
                    detectedComplexity={result.detectedComplexity}
                    optimalComplexity={result.optimalComplexity}
                  />
                </div>
              </div>
            )}

            {showSolution && (
              <div className="puzzle-solution">
                <h4>Sample solution</h4>
                <pre>{active.sampleSolution}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
//  MCQ section
// ═════════════════════════════════════════════════════════════════
function McqSection() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    practiceService.listMcqs()
      .then(setQuestions)
      .catch((err) => setError(err.message || 'Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  const current = questions[currentIdx];

  const handleSelect = async (idx) => {
    if (revealed) return;
    setSelectedIdx(idx);
    setRevealed(true);
    setAttempts((a) => a + 1);
    try {
      const r = await practiceService.checkMcq(current.id, idx);
      if (r.correct) setScore((s) => s + 1);
    } catch (err) {
      // Even if check fails, reveal locally with no scoring
      setError('Could not verify answer — but you can still proceed.');
    }
  };

  const handleNext = () => {
    setSelectedIdx(null);
    setRevealed(false);
    setError('');
    setCurrentIdx((i) => (i + 1) % questions.length);
  };

  if (loading) return <div className="practice-loading"><Loader2 className="spin" size={24} /> Loading quiz…</div>;
  if (!current) return <div className="practice-error">{error || 'No questions available.'}</div>;

  return (
    <div className="mcq-section">
      {/* Progress */}
      <div className="mcq-progress">
        <div className="mcq-progress-bar">
          <div className="mcq-progress-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
        </div>
        <div className="mcq-stats">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span className="mcq-score">
            <CheckCircle2 size={14} /> Score: <strong>{score}</strong>/{attempts}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="mcq-card" key={current.id}>
        <div className="mcq-question">
          <span className="mcq-number">Q{currentIdx + 1}</span>
          <h3>{current.question}</h3>
        </div>

        <div className="mcq-options">
          {current.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = revealed && idx === current.correctIndex;
            const isWrong = revealed && isSelected && idx !== current.correctIndex;
            return (
              <button
                key={idx}
                className={`mcq-option ${revealed ? 'revealed' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${isSelected && !revealed ? 'selected' : ''}`}
                onClick={() => handleSelect(idx)}
                disabled={revealed}
                style={{ '--option-idx': idx }}
              >
                <span className="mcq-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="mcq-text">{opt}</span>
                {isCorrect && <CheckCircle2 size={18} className="mcq-mark" />}
                {isWrong && <XCircle size={18} className="mcq-mark" />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className={`mcq-explanation ${selectedIdx === current.correctIndex ? 'pass' : 'fail'}`}>
            <div className="mcq-explanation-header">
              {selectedIdx === current.correctIndex ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <strong>{selectedIdx === current.correctIndex ? 'Correct!' : 'Not quite'}</strong>
            </div>
            <p>{current.explanation}</p>
          </div>
        )}

        <div className="mcq-actions">
          <button className="button" onClick={handleNext} disabled={!revealed}>
            Next question <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

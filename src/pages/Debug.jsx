import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

/**
 * Diagnostic page — helps debug "Cannot reach the server" errors.
 * Visits /debug in the browser to see:
 *   - The resolved API_BASE_URL
 *   - Whether the backend /health endpoint is reachable
 *   - Whether /api/jobs/external is reachable
 *   - The exact error message if anything fails
 *
 * Useful for distinguishing between:
 *   - Backend down (server-side issue)
 *   - CORS blocked (browser security policy)
 *   - Ad blocker blocking the request
 *   - Network connectivity issue
 *   - Stale cache
 */
export default function Debug() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    setResults([]);
    const checks = [];

    // Check 1: API_BASE_URL resolution
    checks.push({
      name: 'API_BASE_URL resolution',
      status: 'pass',
      detail: `Resolved to: ${API_BASE_URL}`,
    });
    setResults([...checks]);

    // Check 2: Network connectivity (no-cors, just see if the server responds at all)
    try {
      const start = performance.now();
      const res = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        mode: 'no-cors',  // bypass CORS to test raw connectivity
        cache: 'no-store',
      });
      const elapsed = Math.round(performance.now() - start);
      checks.push({
        name: 'Backend /health reachable (no-cors)',
        status: 'pass',
        detail: `Response received in ${elapsed}ms (type: ${res.type}, status: opaque)`,
      });
    } catch (err) {
      checks.push({
        name: 'Backend /health reachable (no-cors)',
        status: 'fail',
        detail: err.message,
      });
    }
    setResults([...checks]);

    // Check 3: CORS preflight (OPTIONS request)
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/external?pageSize=1`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type',
        },
      });
      const corsHeader = res.headers.get('access-control-allow-origin');
      checks.push({
        name: 'CORS preflight (OPTIONS)',
        status: corsHeader ? 'pass' : 'warn',
        detail: `HTTP ${res.status} | Allow-Origin: ${corsHeader || '(missing)'}`,
      });
    } catch (err) {
      checks.push({
        name: 'CORS preflight (OPTIONS)',
        status: 'fail',
        detail: err.message,
      });
    }
    setResults([...checks]);

    // Check 4: Actual GET request (the real one the app uses)
    try {
      const start = performance.now();
      const res = await fetch(`${API_BASE_URL}/jobs/external?pageSize=2`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
      const elapsed = Math.round(performance.now() - start);
      const corsHeader = res.headers.get('access-control-allow-origin');
      const contentType = res.headers.get('content-type');

      if (!res.ok) {
        const body = await res.text();
        checks.push({
          name: 'GET /api/jobs/external (real request)',
          status: 'fail',
          detail: `HTTP ${res.status} | CORS: ${corsHeader || '(missing)'} | CT: ${contentType} | Body: ${body.slice(0, 200)}`,
        });
      } else {
        const data = await res.json();
        checks.push({
          name: 'GET /api/jobs/external (real request)',
          status: 'pass',
          detail: `HTTP ${res.status} | ${elapsed}ms | ${data.items?.length || 0} jobs | CORS: ${corsHeader}`,
        });
      }
    } catch (err) {
      checks.push({
        name: 'GET /api/jobs/external (real request)',
        status: 'fail',
        detail: `${err.name}: ${err.message}`,
      });
    }
    setResults([...checks]);

    // Check 5: localStorage (token present?)
    const token = localStorage.getItem('jobboard_token');
    const user = localStorage.getItem('jobboard_user');
    checks.push({
      name: 'localStorage auth state',
      status: token ? 'pass' : 'warn',
      detail: `Token: ${token ? 'present' : 'absent'} | User: ${user ? 'present' : 'absent'}`,
    });
    setResults([...checks]);

    setRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <section className="dashboard">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="dash-welcome">
          <div>
            <p className="kicker">Diagnostics</p>
            <h1>Connection Debug</h1>
            <p>Tests connectivity to the backend from your browser. Useful for diagnosing "Cannot reach the server" errors.</p>
          </div>
          <button className="button" onClick={runDiagnostics} disabled={running}>
            <RefreshCw size={16} className={running ? 'spin' : ''} />
            {running ? 'Running…' : 'Re-run diagnostics'}
          </button>
        </div>

        <div className="application-panel" style={{ marginTop: 30 }}>
          <div className="panel-heading">
            <div>
              <h2>Test results</h2>
              <p>Each test runs in your browser, exactly like the app would.</p>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
            {results.length === 0 && (
              <p style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>
                <Loader2 size={20} className="spin" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Running diagnostics…
              </p>
            )}
            {results.map((r, i) => (
              <div
                key={i}
                className="card-inset"
                style={{
                  borderColor: r.status === 'pass' ? 'var(--success)' : r.status === 'fail' ? 'var(--danger)' : 'var(--warn)',
                }}
              >
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {r.status === 'pass' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                  {r.status === 'fail' && <XCircle size={16} style={{ color: 'var(--danger)' }} />}
                  {r.status === 'warn' && <span style={{ color: 'var(--warn)' }}>⚠</span>}
                  {r.name}
                </h4>
                <p style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)', wordBreak: 'break-all' }}>
                  {r.detail}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 30, padding: 20, background: 'var(--cloud)', borderRadius: 12, fontSize: 13, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--ink)' }}>How to interpret:</strong>
            <ul style={{ margin: '12px 0 0', paddingLeft: 20, lineHeight: 1.8 }}>
              <li><strong style={{ color: 'var(--success)' }}>✓ Pass</strong> — test succeeded, this part works</li>
              <li><strong style={{ color: 'var(--danger)' }}>✗ Fail</strong> — this is the cause of your error</li>
              <li><strong style={{ color: 'var(--warn)' }}>⚠ Warn</strong> — not necessarily broken, but worth noting</li>
            </ul>
            <p style={{ margin: '16px 0 0' }}>
              If Check 1 (no-cors /health) fails → backend is unreachable from your browser (network/DNS issue, or backend truly down).
              <br />
              If Check 1 passes but Check 3 fails → CORS is blocking the request (browser security).
              <br />
              If Check 3 passes but the app still fails → likely an ad blocker or stale browser cache.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

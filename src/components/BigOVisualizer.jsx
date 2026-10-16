import { useEffect, useState } from 'react';
import './BigOVisualizer.css';

const COMPLEXITIES = [
  { label: 'O(1)', fn: (n) => 1, color: '#10b981', desc: 'Constant — best' },
  { label: 'O(log n)', fn: (n) => Math.log2(Math.max(n, 1)) + 1, color: '#06b6d4', desc: 'Logarithmic — great' },
  { label: 'O(n)', fn: (n) => n, color: '#6366f1', desc: 'Linear — good' },
  { label: 'O(n log n)', fn: (n) => n * Math.log2(Math.max(n, 1)), color: '#f59e0b', desc: 'Linearithmic — ok' },
  { label: 'O(n^2)', fn: (n) => n * n, color: '#ef4444', desc: 'Quadratic — bad' },
  { label: 'O(2^n)', fn: (n) => Math.pow(2, Math.min(n, 20)), color: '#dc2626', desc: 'Exponential — terrible' },
];

/**
 * Animated SVG visualization of Big-O complexity curves.
 * Highlights the user's detected complexity in solid color, others as faded.
 *
 * @param {string} detectedComplexity  e.g. "O(n)", "O(log n)"
 * @param {string} optimalComplexity
 */
export default function BigOVisualizer({ detectedComplexity, optimalComplexity }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, [detectedComplexity]);

  const width = 600;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 36, left: 50 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Domain: n = 1..20
  const maxN = 20;
  // Cap visualized y values so O(2^n) doesn't squash everything else
  const maxDisplayY = 100;

  const scaleX = (n) => padding.left + (n / maxN) * plotW;
  const scaleY = (y) => padding.top + plotH - Math.min(y / maxDisplayY, 1) * plotH;

  return (
    <div className="bigo-visualizer">
      <div className="bigo-header">
        <h4>Time complexity comparison</h4>
        <div className="bigo-legend">
          {COMPLEXITIES.map((c) => (
            <div
              key={c.label}
              className={`bigo-legend-item ${detectedComplexity === c.label ? 'active' : ''}`}
            >
              <span className="bigo-dot" style={{ background: c.color }} />
              <span className="bigo-label">{c.label}</span>
              {detectedComplexity === c.label && (
                <span className="bigo-badge" style={{ background: c.color }}>yours</span>
              )}
              {optimalComplexity === c.label && detectedComplexity !== c.label && (
                <span className="bigo-badge optimal">optimal</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="bigo-svg">
        {/* Grid */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={`h-${t}`}
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + plotH * t}
            y2={padding.top + plotH * t}
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth={1}
          />
        ))}
        {[0, 5, 10, 15, 20].map((n) => (
          <line
            key={`v-${n}`}
            x1={scaleX(n)}
            x2={scaleX(n)}
            y1={padding.top}
            y2={padding.top + plotH}
            stroke="rgba(148, 163, 184, 0.10)"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line
          x1={padding.left} x2={padding.left}
          y1={padding.top} y2={padding.top + plotH}
          stroke="#94a3b8" strokeWidth={1.5}
        />
        <line
          x1={padding.left} x2={width - padding.right}
          y1={padding.top + plotH} y2={padding.top + plotH}
          stroke="#94a3b8" strokeWidth={1.5}
        />

        {/* Axis labels */}
        <text x={padding.left - 12} y={padding.top - 6} textAnchor="end" fontSize={10} fill="#64748b" fontWeight={700}>ops</text>
        <text x={width - padding.right} y={padding.top + plotH + 26} textAnchor="end" fontSize={10} fill="#64748b" fontWeight={700}>input size (n)</text>

        {/* Complexity curves */}
        {COMPLEXITIES.map((c) => {
          const points = Array.from({ length: maxN + 1 }, (_, n) => {
            const y = c.fn(n);
            return `${scaleX(n)},${scaleY(y)}`;
          }).join(' ');
          const isDetected = c.label === detectedComplexity;
          const isOptimal = c.label === optimalComplexity;
          const dimmed = !isDetected && !isOptimal;

          return (
            <polyline
              key={c.label}
              points={points}
              fill="none"
              stroke={c.color}
              strokeWidth={isDetected ? 3.5 : isOptimal ? 2.5 : 1.5}
              strokeOpacity={dimmed ? 0.25 : 1}
              strokeDasharray={isOptimal && !isDetected ? '6 4' : 'none'}
              style={{
                transition: 'stroke-opacity 0.4s ease, stroke-width 0.4s ease',
                filter: isDetected ? `drop-shadow(0 0 6px ${c.color}66)` : 'none',
              }}
              pathLength={animated ? 1 : 0}
              className={animated ? 'bigo-curve-animated' : 'bigo-curve-static'}
            />
          );
        })}

        {/* Label on detected curve */}
        {detectedComplexity && (() => {
          const c = COMPLEXITIES.find((x) => x.label === detectedComplexity);
          if (!c) return null;
          const n = maxN * 0.85;
          const y = c.fn(n);
          return (
            <g style={{ transition: 'opacity 0.4s ease 0.4s' }} opacity={animated ? 1 : 0}>
              <circle
                cx={scaleX(n)} cy={scaleY(y)} r={5}
                fill={c.color}
                style={{ filter: `drop-shadow(0 0 4px ${c.color})` }}
              />
              <text
                x={scaleX(n) + 8} y={scaleY(y) - 8}
                fontSize={12} fontWeight={800} fill={c.color}
              >
                {c.label}
              </text>
            </g>
          );
        })()}
      </svg>

      <div className="bigo-explanation">
        {detectedComplexity && (
          <>
            Your solution: <strong style={{ color: COMPLEXITIES.find((c) => c.label === detectedComplexity)?.color }}>
              {detectedComplexity}
            </strong>
            {optimalComplexity && optimalComplexity !== detectedComplexity && (
              <> · Optimal: <strong style={{ color: '#10b981' }}>{optimalComplexity}</strong></>
            )}
          </>
        )}
      </div>
    </div>
  );
}

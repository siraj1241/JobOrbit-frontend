import { useMemo, useRef, useState } from 'react';
import './CodeEditor.css';

/**
 * Lightweight code editor — textarea with line numbers and syntax
 * highlighting overlay. No external dependencies (CodeMirror etc.).
 *
 * @param {string}  value
 * @param {(v: string) => void} onChange
 * @param {string}  language   'sql' | 'javascript' | 'text'
 * @param {string}  placeholder
 * @param {number}  minHeight   in px (default 220)
 */
export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = '// Write your code here',
  minHeight = 220,
}) {
  const taRef = useRef(null);
  const [focused, setFocused] = useState(false);

  const lineCount = useMemo(() => Math.max(value.split('\n').length, 1), [value]);
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1).join('\n'),
    [lineCount]
  );

  const highlighted = useMemo(() => highlight(value, language), [value, language]);

  const handleScroll = (e) => {
    const ta = e.target;
    // Sync the line numbers + highlight overlay scroll with the textarea
    const ln = ta.parentElement.querySelector('.line-numbers');
    const hl = ta.parentElement.querySelector('.highlight-overlay');
    if (ln) ln.scrollTop = ta.scrollTop;
    if (hl) {
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
    }
  };

  const handleTab = (e) => {
    // Insert 2 spaces instead of moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = value.slice(0, start) + '  ' + value.slice(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className={`code-editor ${focused ? 'focused' : ''}`} style={{ minHeight }}>
      <div className="editor-header">
        <span className="editor-lang">{language}</span>
        <div className="editor-dots">
          <span /> <span /> <span />
        </div>
      </div>
      <div className="editor-body" style={{ minHeight: minHeight - 36 }}>
        <pre className="line-numbers" aria-hidden="true">{lineNumbers}</pre>
        <div className="editor-stack">
          <pre
            className="highlight-overlay"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
          />
          <textarea
            ref={taRef}
            className="code-textarea"
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleTab}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Very simple regex-based syntax highlighter.
 * Produces HTML with <span class="..."> wrappers. The highlighting overlay
 * sits behind the transparent textarea — the user types "through" the colors.
 */
function highlight(code, language) {
  if (!code) return '';
  let html = escapeHtml(code);

  if (language === 'sql') {
    // SQL keywords
    html = html.replace(
      /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ON|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|INSERT INTO|VALUES|UPDATE|SET|DELETE|CREATE TABLE|PRIMARY KEY|VARCHAR|INT|DECIMAL|FOREIGN KEY|REFERENCES|NOT NULL|DEFAULT|AND|OR|NOT|IN|LIKE|BETWEEN|IS NULL|IS NOT NULL|ASC|DESC)\b/gi,
      '<span class="kw">$1</span>'
    );
    // Strings
    html = html.replace(/'([^']*)'/g, '<span class="str">\'$1\'</span>');
    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
    // Comments
    html = html.replace(/(--[^\n]*)/g, '<span class="cmt">$1</span>');
  } else if (language === 'javascript') {
    // JS keywords
    html = html.replace(
      /\b(function|const|let|var|return|if|else|for|while|do|break|continue|new|class|extends|super|this|typeof|instanceof|in|of|try|catch|finally|throw|switch|case|default|null|undefined|true|false|NaN|async|await|yield|import|export|from|as|default)\b/g,
      '<span class="kw">$1</span>'
    );
    // Strings (single, double, backtick)
    html = html.replace(/('([^']*)'|"([^"]*)"|`([^`]*)`)/g, '<span class="str">$1</span>');
    // Numbers
    html = html.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="num">$1</span>');
    // Comments
    html = html.replace(/(\/\/[^\n]*)/g, '<span class="cmt">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="cmt">$1</span>');
    // Function calls
    html = html.replace(/\b([a-zA-Z_$][\w$]*)\s*\(/g, '<span class="fn">$1</span>(');
  }

  return html;
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

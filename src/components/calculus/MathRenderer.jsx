import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Renders a string that may contain inline $...$ and display $$...$$ LaTeX blocks
export default function MathRenderer({ text }) {
  if (!text) return null;

  // Split text into segments: $$...$$ | $...$ | plain text
  const segments = [];
  const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  let last = 0;
  let match;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', content: text.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('$$')) {
      segments.push({ type: 'block', content: raw.slice(2, -2).trim() });
    } else {
      segments.push({ type: 'inline', content: raw.slice(1, -1).trim() });
    }
    last = match.index + raw.length;
  }
  if (last < text.length) {
    segments.push({ type: 'text', content: text.slice(last) });
  }

  return (
    <div className="text-sm leading-relaxed space-y-2">
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {seg.content}
            </span>
          );
        }
        return (
          <KatexNode
            key={i}
            latex={seg.content}
            displayMode={seg.type === 'block'}
          />
        );
      })}
    </div>
  );
}

function KatexNode({ latex, displayMode }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
      });
    } catch (e) {
      if (ref.current) ref.current.textContent = latex;
    }
  }, [latex, displayMode]);

  return displayMode
    ? <div ref={ref} className="my-3 overflow-x-auto" />
    : <span ref={ref} className="mx-0.5" />;
}
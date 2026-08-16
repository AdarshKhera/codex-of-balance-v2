import { useEffect, useState } from 'react';
import './prologue.css';

const LINES = [
  'First there was only the making.',
  'Light, and water, and fire, and stone. Each one certain it was the answer.',
  'Then, balance.'
];

const LINE_MS = 2400;

export function Prologue({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= LINES.length) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((n) => n + 1), LINE_MS);
    return () => clearTimeout(t);
  }, [i, onDone]);

  const finished = i >= LINES.length;

  return (
    <div className="prologue" onClick={onDone} role="button" tabIndex={0} aria-label="Skip prologue">
      <div className="prologue__stage">
        {finished ? (
          <div className="prologue__title-block">
            <p className="eyebrow rise" style={{ animationDelay: '120ms' }}>
              Arehk Games
            </p>
            <h1 className="display prologue__title rise" style={{ animationDelay: '260ms' }}>
              The Scale
            </h1>
          </div>
        ) : (
          <p
            key={i}
            className="display prologue__line"
            /* Fed from the constant so the fade can never drift out of step
               with how long the line is actually held. */
            style={{ animationDuration: `${LINE_MS}ms` }}
          >
            {LINES[i]}
          </p>
        )}
      </div>
      <p className="prologue__skip">Tap to continue</p>
    </div>
  );
}

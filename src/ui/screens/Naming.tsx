import { useState } from 'react';
import { BackIcon, ForwardIcon } from '../Icons';
import { RULES } from '../../game/engine';
import './naming.css';

interface NamingProps {
  onBegin: (name: string) => void;
  onBack: () => void;
}

export function Naming({ onBegin, onBack }: NamingProps) {
  const [name, setName] = useState('');
  const trimmed = name.trim();

  return (
    <form
      className="screen naming"
      onSubmit={(e) => {
        e.preventDefault();
        if (trimmed) onBegin(trimmed);
      }}
    >
      <header className="naming__chrome">
        <button className="icon-btn" type="button" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
      </header>

      <main className="naming__main">
        <div className="naming__block">
          <p className="eyebrow rise">Before we begin</p>
          <h2 className="display naming__title rise" style={{ animationDelay: '100ms' }}>
            Who is choosing?
          </h2>
        </div>

        <div className="naming__field rise" style={{ animationDelay: '200ms' }}>
          <input
            className="naming__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={18}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Your name"
          />
          <span className="naming__rule" />
        </div>

        <p className="naming__terms rise" style={{ animationDelay: '280ms' }}>
          Best of {RULES.rounds}. First to {RULES.target} takes the match.
        </p>
      </main>

      <footer className="naming__foot">
        <button
          className="action bloom"
          style={{ animationDelay: '360ms' }}
          type="submit"
          disabled={!trimmed}
          aria-label="Begin"
        >
          <ForwardIcon size={24} />
        </button>
      </footer>
    </form>
  );
}

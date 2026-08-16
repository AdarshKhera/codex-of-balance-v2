import { CodexIcon, PlayIcon, RecordsIcon } from '../Icons';
import './title.css';

interface TitleProps {
  onBegin: () => void;
  onCodex: () => void;
  onRecords: () => void;
  onTutorial: () => void;
}

export function Title({ onBegin, onCodex, onRecords, onTutorial }: TitleProps) {
  return (
    <div className="screen title">
      {/* One icon to each side. Both stacked on the right left the header
          visibly lopsided. */}
      <header className="title__chrome">
        {/* A slow pulse instead of forcing the tutorial open. It draws the
            eye toward "if you're lost, the book is right here" without
            blocking the play button a new visitor actually wants. */}
        <button className="icon-btn title__codex-hint" onClick={onCodex} aria-label="Open the Codex">
          <CodexIcon />
        </button>
        <button className="icon-btn" onClick={onRecords} aria-label="View records">
          <RecordsIcon />
        </button>
      </header>

      <main className="title__main">
        <div className="title__block">
          <p className="eyebrow rise" style={{ animationDelay: '80ms' }}>
            Arehk Games
          </p>
          <h1 className="display title__name rise" style={{ animationDelay: '180ms' }}>
            The Scale
          </h1>
          <p className="title__blurb rise" style={{ animationDelay: '300ms' }}>
            Eighteen elements. Ten levels. Every pair already has a winner.
            The only question is whether you know it yet.
          </p>
        </div>

        <div className="title__actions">
          <button
            className="action bloom"
            style={{ animationDelay: '460ms' }}
            onClick={onBegin}
            aria-label="Begin a match"
          >
            <PlayIcon size={24} />
          </button>

          <button
            className="text-btn title__howto veil"
            style={{ animationDelay: '600ms' }}
            onClick={onTutorial}
          >
            How to play
          </button>
        </div>
      </main>

      <footer className="title__foot veil" style={{ animationDelay: '640ms' }}>
        <span>You are playing against your own conscience.</span>
      </footer>
    </div>
  );
}

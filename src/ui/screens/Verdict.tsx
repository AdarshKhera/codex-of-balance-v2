import { RecordsIcon } from '../Icons';
import { elapsed, matchOutcome } from '../../game/engine';
import type { MatchState } from '../../game/engine';
import { romanNumeral } from '../../game/ascent';
import type { Chapter } from '../../game/ascent';
import './verdict.css';

interface VerdictProps {
  state: MatchState;
  onAgain: () => void;
  onTitle: () => void;
  onRecords: () => void;
  /** Set only when this win just unlocked a new chapter of the Ascent. */
  chapterUnlocked?: Chapter | null;
  onContinueAscent?: () => void;
}

const COPY = {
  player: {
    label: 'You won',
    line: 'You knew the weight of each one before you set it down.'
  },
  opponent: {
    label: 'You lost',
    line: 'The codex was open the whole time. You just read it late.'
  },
  draw: {
    label: 'A tie',
    line: 'Nothing owed in either direction. Rarer than winning.'
  }
} as const;

export function Verdict({
  state,
  onAgain,
  onTitle,
  onRecords,
  chapterUnlocked,
  onContinueAscent
}: VerdictProps) {
  const outcome = matchOutcome(state);
  const copy = COPY[outcome];

  return (
    <div className="screen verdict">
      <header className="verdict__chrome">
        <button className="icon-btn" onClick={onRecords} aria-label="View records">
          <RecordsIcon />
        </button>
      </header>

      <main className="verdict__main">
        <div className="verdict__block">
          <p className="eyebrow rise">{state.playerName}</p>
          <h2 className={`display verdict__label rise verdict__label--${outcome}`} style={{ animationDelay: '90ms' }}>
            {copy.label}
          </h2>
          <p className="verdict__line rise" style={{ animationDelay: '200ms' }}>
            {copy.line}
          </p>
        </div>

        <dl className="verdict__stats rise" style={{ animationDelay: '300ms' }}>
          <div>
            <dt>Score</dt>
            <dd>
              {state.playerScore}-{state.opponentScore}
            </dd>
          </div>
          <div>
            <dt>Rounds</dt>
            <dd>{state.roundsPlayed}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{elapsed(state)}</dd>
          </div>
        </dl>
      </main>

      {chapterUnlocked ? (
        <footer className="verdict__foot verdict__foot--single rise" style={{ animationDelay: '400ms' }}>
          <p className="verdict__unlocked">
            Chapter {romanNumeral(chapterUnlocked.number)} is open.
          </p>
          <button className="verdict__again" onClick={onContinueAscent}>
            Continue
          </button>
        </footer>
      ) : (
        <footer className="verdict__foot rise" style={{ animationDelay: '400ms' }}>
          <button className="text-btn" onClick={onTitle}>
            Leave
          </button>
          <button className="verdict__again" onClick={onAgain}>
            Again
          </button>
        </footer>
      )}
    </div>
  );
}

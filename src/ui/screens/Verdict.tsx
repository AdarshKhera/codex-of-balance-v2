import { RecordsIcon } from '../Icons';
import { elapsed, maxScore, starsEarned } from '../../game/engine';
import type { MatchState } from '../../game/engine';
import { romanNumeral } from '../../game/ascent';
import type { Chapter } from '../../game/ascent';
import './verdict.css';

interface VerdictProps {
  state: MatchState;
  onAgain: () => void;
  onTitle: () => void;
  onRecords: () => void;
  /** Set only when this clear just unlocked a new chapter of the Ascent. */
  chapterUnlocked?: Chapter | null;
  onContinueAscent?: () => void;
}

export function Verdict({
  state,
  onAgain,
  onTitle,
  onRecords,
  chapterUnlocked,
  onContinueAscent
}: VerdictProps) {
  const cleared = state.status === 'cleared';
  const stars = starsEarned(state);
  const max = maxScore(state.config);

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
          <h2 className={`display verdict__label rise verdict__label--${cleared ? 'win' : 'lose'}`} style={{ animationDelay: '90ms' }}>
            {cleared ? 'Cleared' : 'Not this time'}
          </h2>

          {cleared ? (
            <Stars earned={stars} />
          ) : (
            <p className="verdict__line rise" style={{ animationDelay: '200ms' }}>
              Out of lives. The pattern was there, you'll see it next time.
            </p>
          )}
        </div>

        <dl className="verdict__stats rise" style={{ animationDelay: '300ms' }}>
          <div>
            <dt>Score</dt>
            <dd>
              {state.score} / {max}
            </dd>
          </div>
          <div>
            <dt>Rounds</dt>
            <dd>{state.roundIndex}</dd>
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
            {cleared ? 'Again' : 'Retry'}
          </button>
        </footer>
      )}
    </div>
  );
}

function Stars({ earned }: { earned: number }) {
  return (
    <div className="verdict__stars rise" style={{ animationDelay: '200ms' }} aria-label={`${earned} of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <StarIcon key={n} filled={n <= earned} />
      ))}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
      className={filled ? 'is-filled' : ''}
      aria-hidden="true"
    >
      <path d="M16 4l3.4 8.1 8.6.7-6.6 5.7 2 8.5-7.4-4.6-7.4 4.6 2-8.5-6.6-5.7 8.6-.7L16 4Z" />
    </svg>
  );
}

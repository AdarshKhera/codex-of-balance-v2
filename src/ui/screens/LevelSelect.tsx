import { BackIcon } from '../Icons';
import { CHAPTERS, chapterConfig, elementsThroughChapter, romanNumeral } from '../../game/ascent';
import { DRAGON_FULL_NAME } from '../../game/elements';
import { maxScore, starsForScore } from '../../game/engine';
import './level-select.css';

interface LevelSelectProps {
  playerName: string;
  highestChapter: number;
  bestScore: Record<number, number>;
  onSelect: (chapter: number) => void;
  onBack: () => void;
}

export function LevelSelect({ playerName, highestChapter, bestScore, onSelect, onBack }: LevelSelectProps) {
  return (
    <div className="screen level-select">
      <header className="level-select__chrome">
        <button className="icon-btn" onClick={onBack} aria-label="Back">
          <BackIcon />
        </button>
        <p className="eyebrow">{playerName}</p>
        <span aria-hidden="true" style={{ width: 44 }} />
      </header>

      <ol className="level-select__list">
        {CHAPTERS.map((c) => {
          const cleared = c.number < highestChapter;
          const current = c.number === highestChapter;
          const locked = c.number > highestChapter;
          const elementCount = elementsThroughChapter(c.number).length;

          return (
            <li key={c.number}>
              <button
                className={`level-row ${locked ? 'is-locked' : ''} ${current ? 'is-current' : ''} ${cleared ? 'is-cleared' : ''}`}
                onClick={() => !locked && onSelect(c.number)}
                disabled={locked}
                aria-label={locked ? `Chapter ${romanNumeral(c.number)}, locked` : `Play Chapter ${romanNumeral(c.number)}, ${c.name}`}
              >
                <span className="level-row__numeral">{romanNumeral(c.number)}</span>
                <span className="level-row__text">
                  <span className="level-row__name">{locked ? '?????' : c.name}</span>
                  <span className="level-row__meta">
                    {locked
                      ? 'Locked'
                      : c.number === 10
                        ? DRAGON_FULL_NAME
                        : `${elementCount} elements`}
                  </span>
                </span>
                <span className="level-row__status" aria-hidden="true">
                  {locked ? (
                    <LockIcon />
                  ) : cleared ? (
                    <MiniStars earned={starsForScore(bestScore[c.number] ?? 0, maxScore(chapterConfig(c.number)))} />
                  ) : (
                    <span className="level-row__dot" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="15" width="16" height="12" rx="2" />
      <path d="M11 15v-4a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MiniStars({ earned }: { earned: number }) {
  return (
    <span className="mini-stars">
      {[1, 2, 3].map((n) => (
        <svg
          key={n}
          width="9"
          height="9"
          viewBox="0 0 32 32"
          fill={n <= earned ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="M16 4l3.4 8.1 8.6.7-6.6 5.7 2 8.5-7.4-4.6-7.4 4.6 2-8.5-6.6-5.7 8.6-.7L16 4Z" />
        </svg>
      ))}
    </span>
  );
}

import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '../Icons';
import type { Record_ } from '../../game/engine';
import { romanNumeral } from '../../game/ascent';
import type { LeaderboardEntry } from '../../game/ascent';
import './records.css';

interface RecordsProps {
  records: Record_[];
  leaderboard: LeaderboardEntry[];
  onClose: () => void;
  onClear: () => void;
}

export function Records({ records, leaderboard, onClose, onClear }: RecordsProps) {
  const [arming, setArming] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  // Two-step, because wiping a record list is not undoable.
  const handleClear = () => {
    if (arming) {
      clearTimeout(timer.current);
      setArming(false);
      onClear();
    } else {
      setArming(true);
      timer.current = setTimeout(() => setArming(false), 3200);
    }
  };

  return (
    <div className="screen records">
      <header className="records__chrome">
        <div>
          <p className="eyebrow">Saved</p>
          <h2 className="display records__title">Your matches</h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close records">
          <CloseIcon />
        </button>
      </header>

      {leaderboard.length > 0 && (
        <ol className="records__leaderboard">
          {leaderboard.map((e, i) => (
            <li key={e.name} className="ascent-row">
              <span className="ascent-row__rank">{i + 1}</span>
              <span className="ascent-row__name">{e.name}</span>
              <span className="ascent-row__chapter">Ch. {romanNumeral(e.highestChapter)}</span>
              <span className="ascent-row__wins">{e.totalScore} pts</span>
            </li>
          ))}
        </ol>
      )}

      {records.length === 0 ? (
        <div className="records__empty">
          <p className="display">No matches yet.</p>
          <p>Your last ten are saved here, best result first.</p>
        </div>
      ) : (
        <>
          <ol className="records__list">
            {records.map((r, i) => (
              <li key={`${r.date}-${i}`} className="record">
                <span className="record__rank">{String(i + 1).padStart(2, '0')}</span>
                <span className="record__who">
                  <span className="record__name">{r.name}</span>
                  <span className="record__meta">
                    {r.date} · {r.duration}
                  </span>
                </span>
                <span className={`record__score ${r.margin > 0 ? 'is-up' : r.margin < 0 ? 'is-down' : ''}`}>
                  {r.score}
                </span>
              </li>
            ))}
          </ol>

          <button
            className={`records__clear ${arming ? 'is-arming' : ''}`}
            onClick={handleClear}
          >
            {arming ? 'Tap again to erase' : 'Erase records'}
          </button>
        </>
      )}
    </div>
  );
}

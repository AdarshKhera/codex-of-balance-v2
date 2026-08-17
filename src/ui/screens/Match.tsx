import { useEffect, useState } from 'react';
import { Sigil } from '../Sigil';
import { BackIcon, CodexIcon, PlayIcon } from '../Icons';
import { DRAGON, DRAGON_FULL_NAME, ELEMENT_NAME } from '../../game/elements';
import type { ElementId } from '../../game/elements';
import { POINTS, dragonReady, upcoming } from '../../game/engine';
import type { MatchState } from '../../game/engine';
import './match.css';

interface MatchProps {
  state: MatchState;
  onChoose: (element: ElementId | 'dragon') => void;
  onNext: () => void;
  onQuit: () => void;
  onCodex: () => void;
}

/* Your conscience moves first and stays on screen the whole time you're
   choosing, so the suspense is never "what did they play", it's "did you
   answer it right". The reveal only has to stage your own answer landing,
   the line, then the verdict. */
const BEATS = [0, 480, 1080];

export function Match({ state, onChoose, onNext, onQuit, onCodex }: MatchProps) {
  const { round } = state;
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!round) {
      setBeat(0);
      return;
    }
    setBeat(0);
    const timers = BEATS.slice(1).map((ms, i) => setTimeout(() => setBeat(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [round]);

  const verdict =
    round?.outcome === 'win' ? 'You won' : round?.outcome === 'lose' ? 'You lost' : 'Tie';
  const points = round ? POINTS[round.outcome] : 0;

  return (
    <div className="screen match">
      <header className="match__chrome">
        <button className="icon-btn" onClick={onQuit} aria-label="Leave match">
          <BackIcon />
        </button>
        <Pips history={state.history} rounds={state.config.rounds} />
        <button className="icon-btn" onClick={onCodex} aria-label="Open the Codex">
          <CodexIcon />
        </button>
      </header>

      <div className="match__score">
        <div className="match__score-block">
          <span className="match__score-value">{state.score}</span>
          <span className="match__score-label">Score</span>
        </div>
        <Lives lives={state.lives} />
      </div>

      <main className="match__stage">
        {round ? (
          <div className="reveal">
            {/* Opponent stays in the same top spot it held while you were
                choosing. Your answer grows in underneath it, so nothing
                jumps sideways to a place it was never shown before. */}
            <div className="reveal__stack">
              <figure className="reveal__slot reveal__slot--theirs is-in">
                <Sigil element={round.opponent} size={64} />
                <figcaption>Opponent played</figcaption>
              </figure>

              <span className="reveal__seam-v" aria-hidden="true" />

              <figure className={`reveal__slot reveal__slot--mine ${beat >= 0 ? 'is-in' : ''}`}>
                <Sigil element={round.player} size={64} />
                <figcaption>You answered</figcaption>
              </figure>
            </div>

            <blockquote className={`reveal__line display ${beat >= 1 ? 'is-in' : ''}`}>
              {round.line}
            </blockquote>

            <div className={`reveal__close ${beat >= 2 ? 'is-in' : ''}`}>
              <p className={`reveal__verdict reveal__verdict--${round.outcome}`}>
                {verdict}
                <span className="reveal__points">
                  {points > 0 ? `+${points}` : points}
                </span>
              </p>
              {round.outcome === 'lose' && <p className="reveal__life-lost">A life is gone.</p>}
              {!state.complete && (
                <button className="action action--small" onClick={onNext} aria-label="Next round">
                  <PlayIcon size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <Choosing state={state} onChoose={onChoose} />
        )}
      </main>
    </div>
  );
}

function Lives({ lives }: { lives: number }) {
  if (!Number.isFinite(lives)) return <span className="lives lives--infinite">&infin;</span>;
  return (
    <div className="lives" aria-label={`${lives} lives remaining`}>
      {Array.from({ length: 3 }, (_, i) => (
        <HeartIcon key={i} full={i < lives} />
      ))}
    </div>
  );
}

function HeartIcon({ full }: { full: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 32 32"
      fill={full ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`lives__heart ${full ? 'is-full' : ''}`}
      aria-hidden="true"
    >
      <path d="M16 27c-6.5-4.3-11-8.4-11-13.6C5 9.6 7.9 7 11.2 7c2 0 3.8 1 4.8 2.7C17 8 18.8 7 20.8 7 24.1 7 27 9.6 27 13.4 27 18.6 22.5 22.7 16 27Z" />
    </svg>
  );
}

function Pips({ history, rounds }: { history: string[]; rounds: number }) {
  return (
    <ol
      className={`pips ${rounds > 10 ? 'pips--wide' : ''}`}
      aria-label={`Round ${history.length} of ${rounds}`}
    >
      {Array.from({ length: rounds }, (_, i) => (
        <li key={i} className={`pip ${history[i] ? `pip--${history[i]}` : ''}`} />
      ))}
    </ol>
  );
}

function Choosing({ state, onChoose }: { state: MatchState; onChoose: (e: ElementId | 'dragon') => void }) {
  const { current, next } = upcoming(state);
  const dragonUsable = dragonReady(state);

  const pick = (e: ElementId | 'dragon') => {
    navigator.vibrate?.(8);
    onChoose(e);
  };

  return (
    <div className="choosing">
      <div className="ask">
        <p className="ask__label">Opponent plays</p>
        <div className="ask__current">
          <Sigil element={current} size={56} />
          <span>{ELEMENT_NAME[current]}</span>
        </div>
        {next.length > 0 && (
          <div className="ask__next">
            <span className="ask__next-label">Then</span>
            {next.map((e, i) => (
              <span key={i} className="ask__next-item">
                <Sigil element={e} size={20} />
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="hand">
        <p className="hand__prompt">Choose one</p>
        {/* Iterates the level's full pool, not the shrinking hand, so a
            spent element stays exactly where it was, dimmed and labelled,
            instead of vanishing and reflowing everything after it. */}
        <div className="hand__grid">
          {state.config.pool.map((element, i) => {
            const spent = !state.hand.includes(element);
            return (
              <button
                key={element}
                className={`chip ${spent ? 'is-spent' : ''}`}
                style={{ animationDelay: `${Math.min(i * 22, 400)}ms` }}
                onClick={() => !spent && pick(element)}
                disabled={spent}
                aria-label={spent ? `${ELEMENT_NAME[element]}, already used` : ELEMENT_NAME[element]}
              >
                <span className="chip__mark" style={{ color: `var(--el-${element})` }}>
                  <Sigil element={element} size={30} />
                </span>
                <span className="chip__name">{ELEMENT_NAME[element]}</span>
                {spent && <span className="chip__used">Used</span>}
              </button>
            );
          })}
          {state.config.dragonAvailable && (
            <button
              className={`chip chip--dragon ${state.dragonUsed ? 'is-spent' : ''}`}
              onClick={() => dragonUsable && pick('dragon')}
              disabled={!dragonUsable}
              aria-label={
                state.dragonUsed
                  ? `${DRAGON_FULL_NAME}, already used`
                  : `Spend your ${DRAGON_FULL_NAME} charge`
              }
            >
              <span className="chip__mark" style={{ color: `var(--el-${DRAGON})` }}>
                <Sigil element={DRAGON} size={30} />
              </span>
              <span className="chip__name">Dragon</span>
              {state.dragonUsed && <span className="chip__used">Used</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

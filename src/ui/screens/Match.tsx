import { useEffect, useState } from 'react';
import { Sigil } from '../Sigil';
import { BackIcon, CodexIcon, PlayIcon } from '../Icons';
import { ELEMENT_NAME } from '../../game/elements';
import type { ElementId } from '../../game/elements';
import type { MatchState } from '../../game/engine';
import './match.css';

interface MatchProps {
  state: MatchState;
  onChoose: (element: ElementId) => void;
  onNext: () => void;
  onQuit: () => void;
  onCodex: () => void;
}

/* The reveal is staged in beats rather than dumped on screen at once. Each
   beat is a separate moment: your choice, their answer, the line, the verdict.
   Timing here is the difference between "a result appeared" and "something
   happened to you". */
const BEATS = [0, 480, 1080, 1560];

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
        <Side name={state.playerName} score={state.playerScore} align="start" mine />
        <span className="match__tally">
          {state.roundsPlayed} / {state.config.rounds}
        </span>
        <Side name="Conscience" score={state.opponentScore} align="end" />
      </div>

      <main className="match__stage">
        {round ? (
          <div className="reveal">
            <div className="reveal__pair">
              <figure className={`reveal__slot reveal__slot--mine ${beat >= 0 ? 'is-in' : ''}`}>
                <Sigil element={round.player} size={72} />
                <figcaption>{ELEMENT_NAME[round.player]}</figcaption>
              </figure>

              <span className="reveal__seam" aria-hidden="true" />

              <figure className={`reveal__slot reveal__slot--theirs ${beat >= 1 ? 'is-in' : ''}`}>
                <Sigil element={round.opponent} size={72} />
                <figcaption>{ELEMENT_NAME[round.opponent]}</figcaption>
              </figure>
            </div>

            <blockquote className={`reveal__line display ${beat >= 2 ? 'is-in' : ''}`}>
              {round.line}
            </blockquote>

            <div className={`reveal__close ${beat >= 3 ? 'is-in' : ''}`}>
              <p className={`reveal__verdict reveal__verdict--${round.outcome}`}>{verdict}</p>
              {!state.complete && (
                <button className="action action--small" onClick={onNext} aria-label="Next round">
                  <PlayIcon size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <Hand hand={state.hand} onChoose={onChoose} />
        )}
      </main>
    </div>
  );
}

function Side({
  name,
  score,
  align,
  mine
}: {
  name: string;
  score: number;
  align: 'start' | 'end';
  mine?: boolean;
}) {
  return (
    <div className={`side side--${align} ${mine ? 'side--mine' : ''}`}>
      <span className="side__name">{name}</span>
      <span className="side__score">{score}</span>
    </div>
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

function Hand({ hand, onChoose }: { hand: ElementId[]; onChoose: (e: ElementId) => void }) {
  const hasDragon = hand.includes('dragon');

  return (
    <div className="hand">
      <p className="hand__prompt">
        {hasDragon ? 'The Dragon is on the table.' : 'Choose.'}
      </p>

      <div className="hand__grid">
        {hand.map((element, i) => (
          <button
            key={element}
            className={`chip ${element === 'dragon' ? 'chip--dragon' : ''}`}
            style={{ animationDelay: `${Math.min(i * 22, 400)}ms` }}
            onClick={() => {
              // Light haptic on selection where supported. Silent no-op elsewhere.
              navigator.vibrate?.(8);
              onChoose(element);
            }}
            aria-label={ELEMENT_NAME[element]}
          >
            <span className="chip__mark" style={{ color: `var(--el-${element})` }}>
              <Sigil element={element} size={30} />
            </span>
            <span className="chip__name">{ELEMENT_NAME[element]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

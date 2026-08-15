import { useState } from 'react';
import { Sigil } from '../Sigil';
import { CloseIcon, CodexIcon } from '../Icons';
import { RULES } from '../../game/engine';
import './tutorial.css';

interface TutorialProps {
  onClose: () => void;
  /** Jump straight into the Codex from the last step. */
  onOpenCodex: () => void;
}

const STEPS = [
  {
    title: 'Pick an element',
    body: `Every round you choose one of eighteen. That is your whole move.`
  },
  {
    title: 'Your opponent picks too',
    body: `Neither of you sees the other's choice until both are down.`
  },
  {
    title: 'Every pair has an answer',
    body: `Some beat each other, some tie. Win ${RULES.target} rounds out of ${RULES.rounds} and the match is yours.`
  }
] as const;

export function Tutorial({ onClose, onOpenCodex }: TutorialProps) {
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;

  return (
    <div className="tutorial" onClick={onClose} role="presentation">
      <div
        className="tutorial__card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="How to play"
      >
        <header className="tutorial__head">
          <span className="eyebrow">How to play</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="tutorial__art" key={step}>
          {step === 0 && <StepPick />}
          {step === 1 && <StepBlind />}
          {step === 2 && <StepResolve />}
        </div>

        <div className="tutorial__text" key={`t${step}`}>
          <h3 className="display tutorial__title">{STEPS[step].title}</h3>
          <p className="tutorial__body">{STEPS[step].body}</p>
        </div>

        {last && (
          <button className="tutorial__hint" onClick={onOpenCodex}>
            <CodexIcon size={17} />
            <span>
              Not sure what beats what? Open the book any time to see every
              matchup.
            </span>
          </button>
        )}

        <footer className="tutorial__foot">
          <ol className="tutorial__dots" aria-hidden="true">
            {STEPS.map((_, i) => (
              <li key={i} className={`tutorial__dot ${i === step ? 'is-on' : ''}`} />
            ))}
          </ol>

          <div className="tutorial__actions">
            {step > 0 && (
              <button className="text-btn" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            <button
              className="tutorial__next"
              onClick={() => (last ? onClose() : setStep((s) => s + 1))}
            >
              {last ? 'Got it' : 'Next'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* The illustrations reuse the real sigils rather than stand-in artwork, so what
   the tutorial shows is literally what the player will be tapping. */

function StepPick() {
  const row = ['fire', 'water', 'stone', 'dream'] as const;
  return (
    <div className="art art--row">
      {row.map((e, i) => (
        <span
          key={e}
          className={`art__chip ${i === 1 ? 'is-chosen' : ''}`}
          style={{ color: `var(--el-${e})`, animationDelay: `${i * 70}ms` }}
        >
          <Sigil element={e} size={28} />
        </span>
      ))}
    </div>
  );
}

function StepBlind() {
  return (
    <div className="art art--pair">
      <span className="art__side" style={{ color: 'var(--gilt)' }}>
        <Sigil element="water" size={36} />
        <em>You</em>
      </span>
      <span className="art__seam" />
      <span className="art__side art__side--hidden">
        <span className="art__unknown">?</span>
        <em>Conscience</em>
      </span>
    </div>
  );
}

function StepResolve() {
  return (
    <div className="art art--stack">
      <div className="art__pair">
        <span className="art__side" style={{ color: 'var(--gilt)' }}>
          <Sigil element="water" size={36} />
          <em>You</em>
        </span>
        <span className="art__seam" />
        <span className="art__side" style={{ color: 'var(--el-fire)' }}>
          <Sigil element="fire" size={36} />
          <em>Conscience</em>
        </span>
      </div>
      <p className="art__verdict">Water puts out fire. You won.</p>
    </div>
  );
}

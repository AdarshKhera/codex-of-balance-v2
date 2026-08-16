import { useState } from 'react';
import { Sigil } from '../Sigil';
import { CloseIcon, CodexIcon } from '../Icons';
import { DRAGON } from '../../game/elements';
import './tutorial.css';

interface TutorialProps {
  onClose: () => void;
  /** Jump straight into the Codex from the last step. */
  onOpenCodex: () => void;
}

const STEPS = [
  {
    title: 'They move first',
    body: 'Every round, your conscience reveals an element before you choose. Nothing to guess, only the answer to know.'
  },
  {
    title: 'Answer, but spend wisely',
    body: "Each element is single-use for the whole level. Beat Fire with Water now, and Water's gone if something else needs it later."
  },
  {
    title: "See what's coming",
    body: 'You always know the current move and the next two after it. Plan ahead, don’t just react to what’s in front of you.'
  },
  {
    title: 'Points, and three lives',
    body: 'Beat them: +3. Tie: +1. Lose: 0, and a life. Lose all three lives and the level ends, you just try again.'
  },
  {
    title: 'One Dragon, once',
    body: 'From Chapter V on, you carry one Dragon charge per level. It beats anything. Spend it on the round nothing else can answer.'
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
          {step === 0 && <StepFirst />}
          {step === 1 && <StepSpend />}
          {step === 2 && <StepQueue />}
          {step === 3 && <StepScore />}
          {step === 4 && <StepDragon />}
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

function StepFirst() {
  return (
    <div className="art art--stack">
      <span className="art__side" style={{ color: 'var(--el-fire)' }}>
        <Sigil element="fire" size={40} />
        <em>Conscience plays</em>
      </span>
    </div>
  );
}

function StepSpend() {
  const row = ['fire', 'water', 'stone', 'dream'] as const;
  return (
    <div className="art art--row">
      {row.map((e, i) => (
        <span
          key={e}
          className={`art__chip ${i === 1 ? 'is-spent' : ''}`}
          style={{ color: `var(--el-${e})`, animationDelay: `${i * 70}ms` }}
        >
          <Sigil element={e} size={28} />
        </span>
      ))}
    </div>
  );
}

function StepQueue() {
  return (
    <div className="art art--queue">
      <span className="art__side" style={{ color: 'var(--gilt)' }}>
        <Sigil element="lightning" size={36} />
        <em>Now</em>
      </span>
      <span className="art__queue-next">
        <span className="art__mini"><Sigil element="ice" size={18} /></span>
        <span className="art__mini"><Sigil element="stone" size={18} /></span>
        <em>Then</em>
      </span>
    </div>
  );
}

function StepScore() {
  return (
    <div className="art art--score">
      <span className="art__points">+3</span>
      <span className="art__points art__points--tie">+1</span>
      <span className="art__lives">
        <span className="art__life is-full" />
        <span className="art__life is-full" />
        <span className="art__life" />
      </span>
    </div>
  );
}

function StepDragon() {
  return (
    <div className="art art--stack">
      <span className="art__side art__dragon" style={{ color: 'var(--el-dragon)' }}>
        <Sigil element={DRAGON} size={44} />
        <em>Once per level</em>
      </span>
    </div>
  );
}

import { useState } from 'react';
import { Sigil } from '../Sigil';
import { CloseIcon } from '../Icons';
import {
  CORE_ELEMENTS,
  DRAGON,
  DRAGON_FULL_NAME,
  ELEMENT_NAME,
  ELEMENT_NOTE,
  relations
} from '../../game/elements';
import type { ElementId } from '../../game/elements';
import { RULES } from '../../game/engine';
import './codex.css';

/* The rules screen, as an index of the elements rather than a bullet list.
   Everything shown here is derived from the same matchup table the match
   resolves against, so the two can never disagree. */
export function Codex({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<ElementId | null>(null);

  return (
    <div className="screen codex">
      <header className="codex__chrome">
        <div>
          <p className="eyebrow">The Codex</p>
          <h2 className="display codex__title">What beats what</h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close the Codex">
          <CloseIcon />
        </button>
      </header>

      <p className="codex__intro">
        Every round, you pick one element. Your opponent picks one too, without
        seeing yours. Every pair already has an answer: some beat each other,
        some tie. Win {RULES.target} rounds out of {RULES.rounds} and the match
        is yours. Now and then the Dragon is dealt in. The Dragon beats
        everything except another Dragon, so take it when you see it.
      </p>

      <ul className="codex__list">
        {CORE_ELEMENTS.map((element) => {
          const isOpen = open === element;
          const { beats, losesTo, holds } = relations(element);
          return (
            <li key={element}>
              <button
                className={`entry ${isOpen ? 'is-open' : ''}`}
                onClick={() => setOpen(isOpen ? null : element)}
                aria-expanded={isOpen}
              >
                <span className="entry__mark" style={{ color: `var(--el-${element})` }}>
                  <Sigil element={element} size={26} />
                </span>
                <span className="entry__text">
                  <span className="entry__name">{ELEMENT_NAME[element]}</span>
                  <span className="entry__note">{ELEMENT_NOTE[element]}</span>
                </span>
                <span className="entry__count">
                  {beats.length}·{losesTo.length}·{holds.length}
                </span>
              </button>

              {isOpen && (
                <div className="entry__detail veil">
                  <Relation label="Beats" list={beats} tone="win" />
                  <Relation label="Loses to" list={losesTo} tone="lose" />
                  <Relation label="Ties with" list={holds} tone="tie" />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="codex__dragon">
        <span className="entry__mark" style={{ color: `var(--el-${DRAGON})` }}>
          <Sigil element={DRAGON} size={26} />
        </span>
        <div className="entry__text">
          <span className="entry__name">{DRAGON_FULL_NAME}</span>
          <span className="entry__note">{ELEMENT_NOTE[DRAGON]}</span>
        </div>
      </div>
    </div>
  );
}

function Relation({
  label,
  list,
  tone
}: {
  label: string;
  list: ElementId[];
  tone: 'win' | 'lose' | 'tie';
}) {
  if (!list.length) return null;
  return (
    <div className="relation">
      <span className={`relation__label relation__label--${tone}`}>{label}</span>
      <span className="relation__items">
        {list.map((e) => (
          <span key={e} className="relation__item">
            <Sigil element={e} size={13} />
            {ELEMENT_NAME[e]}
          </span>
        ))}
      </span>
    </div>
  );
}

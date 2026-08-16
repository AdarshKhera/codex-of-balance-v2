import { Sigil } from '../Sigil';
import { ELEMENT_NAME, ELEMENT_NOTE, DRAGON, DRAGON_FULL_NAME } from '../../game/elements';
import { romanNumeral } from '../../game/ascent';
import type { Chapter } from '../../game/ascent';
import './chapter-clear.css';

interface ChapterClearProps {
  chapter: Chapter;
  onContinue: () => void;
}

/** Chapter ten adds no core element, it adds the Dragon. Shown the same way. */
export function ChapterClear({ chapter, onContinue }: ChapterClearProps) {
  const reveals =
    chapter.adds.length > 0
      ? chapter.adds
      : chapter.number === 10
        ? [DRAGON]
        : [];

  return (
    <div className="screen chapter-clear">
      <main className="chapter-clear__main">
        <p className="eyebrow rise">Chapter {romanNumeral(chapter.number)}</p>
        <h1 className="display chapter-clear__name rise" style={{ animationDelay: '100ms' }}>
          {chapter.name}
        </h1>
        <p className="chapter-clear__blurb rise" style={{ animationDelay: '200ms' }}>
          {chapter.blurb}
        </p>

        <div className="chapter-clear__reveal">
          {reveals.map((el, i) => (
            <div
              key={el}
              className="chapter-clear__element bloom"
              style={{ animationDelay: `${340 + i * 160}ms` }}
            >
              <span className="chapter-clear__sigil" style={{ color: `var(--el-${el})` }}>
                <Sigil element={el} size={40} />
              </span>
              <span className="chapter-clear__element-name">
                {el === DRAGON ? DRAGON_FULL_NAME : ELEMENT_NAME[el]}
              </span>
              <span className="chapter-clear__element-note">{ELEMENT_NOTE[el]}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="chapter-clear__foot veil" style={{ animationDelay: '700ms' }}>
        <button className="chapter-clear__continue" onClick={onContinue}>
          {chapter.number >= 10 ? 'Return' : 'Continue'}
        </button>
      </footer>
    </div>
  );
}

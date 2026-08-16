import { Sigil } from '../Sigil';
import { ForwardIcon } from '../Icons';
import { ELEMENT_NAME } from '../../game/elements';
import { romanNumeral } from '../../game/ascent';
import type { Chapter, StudyPair } from '../../game/ascent';
import './study-screen.css';

interface StudyScreenProps {
  chapter: Chapter;
  pairs: StudyPair[];
  onBegin: () => void;
}

/**
 * Shown right before a level starts. Only the relationships that level
 * actually introduces, not the whole table, so it stays readable at four
 * elements and still finishes in well under a minute at eighteen.
 */
export function StudyScreen({ chapter, pairs, onBegin }: StudyScreenProps) {
  const isDragonChapter = chapter.number === 10;
  const isReviewChapter = !isDragonChapter && pairs.length === 0;

  return (
    <div className="screen study">
      <main className="study__main">
        <p className="eyebrow rise">Chapter {romanNumeral(chapter.number)} &middot; {chapter.name}</p>

        {isDragonChapter ? (
          <>
            <h2 className="display study__title rise" style={{ animationDelay: '90ms' }}>
              One rule, and it's absolute.
            </h2>
            <p className="study__note rise" style={{ animationDelay: '180ms' }}>
              The Dragon beats everything. You get one charge this level.
              Spend it whenever you decide nothing else in your hand will do.
            </p>
          </>
        ) : isReviewChapter ? (
          <>
            <h2 className="display study__title rise" style={{ animationDelay: '90ms' }}>
              Nothing new this time.
            </h2>
            <p className="study__note rise" style={{ animationDelay: '180ms' }}>
              All eighteen are already yours. This chapter is just proof you
              actually know them.
            </p>
          </>
        ) : (
          <>
            <h2 className="display study__title rise" style={{ animationDelay: '90ms' }}>
              {pairs.length} new thing{pairs.length === 1 ? '' : 's'} to know.
            </h2>
            <ol className="study__list rise" style={{ animationDelay: '180ms' }}>
              {pairs.map((p, i) => {
                const tied = p.winner === null;
                // Winner always shown first so the fact reads left-to-right,
                // without having to compare colour or weight between sides.
                const winner = tied ? p.a : p.winner!;
                const loser = tied ? p.b : winner === p.a ? p.b : p.a;
                return (
                  <li key={`${p.a}-${p.b}`} className="study-pair" style={{ animationDelay: `${240 + i * 40}ms` }}>
                    <div className="study-pair__matchup">
                      <PairSide element={winner} tied={tied} lead />
                      <span className="study-pair__verb">{tied ? 'ties' : 'beats'}</span>
                      <PairSide element={loser} tied={tied} />
                    </div>
                    <p className="study-pair__line">{p.line}</p>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>

      <footer className="study__foot veil" style={{ animationDelay: '260ms' }}>
        <button className="action bloom" onClick={onBegin} aria-label="Begin level">
          <ForwardIcon size={24} />
        </button>
      </footer>
    </div>
  );
}

function PairSide({
  element,
  tied,
  lead
}: {
  element: Parameters<typeof Sigil>[0]['element'];
  tied: boolean;
  lead?: boolean;
}) {
  return (
    <span className={`study-pair__side ${lead && !tied ? 'is-winner' : ''} ${tied ? 'is-tie' : ''}`}>
      <Sigil element={element} size={26} />
      <span className="study-pair__name">{ELEMENT_NAME[element]}</span>
    </span>
  );
}

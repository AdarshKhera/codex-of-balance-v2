import { useCallback, useEffect, useState } from 'react';
import { Prologue } from './ui/screens/Prologue';
import { Title } from './ui/screens/Title';
import { Naming } from './ui/screens/Naming';
import { Match } from './ui/screens/Match';
import { Verdict } from './ui/screens/Verdict';
import { Codex } from './ui/screens/Codex';
import { Records } from './ui/screens/Records';
import {
  clearRecords,
  createMatch,
  loadRecords,
  nextRound,
  playRound,
  saveRecord
} from './game/engine';
import type { MatchState, Record_ } from './game/engine';
import type { ElementId } from './game/elements';

type View = 'prologue' | 'title' | 'naming' | 'match' | 'verdict' | 'codex' | 'records';

const PROLOGUE_KEY = 'codex.v2.prologue-seen';

export default function App() {
  const [view, setView] = useState<View>(() =>
    localStorage.getItem(PROLOGUE_KEY) ? 'title' : 'prologue'
  );
  /** Where an overlay screen (codex/records) should return to. */
  const [origin, setOrigin] = useState<View>('title');
  const [match, setMatch] = useState<MatchState | null>(null);
  const [records, setRecords] = useState<Record_[]>(loadRecords);

  const openOverlay = (target: 'codex' | 'records') => {
    setOrigin(view);
    setView(target);
  };

  const finishPrologue = useCallback(() => {
    localStorage.setItem(PROLOGUE_KEY, '1');
    setView('title');
  }, []);

  const begin = (name: string) => {
    setMatch(createMatch(name));
    setView('match');
  };

  const choose = (element: ElementId) => {
    setMatch((current) => (current ? playRound(current, element) : current));
  };

  // A completed match lingers on the final reveal for a beat before the
  // verdict, so the last line still gets read.
  useEffect(() => {
    if (view !== 'match' || !match?.complete) return;
    setRecords((existing) => saveRecord(match, existing));
    const t = setTimeout(() => setView('verdict'), 2600);
    return () => clearTimeout(t);
    // Keyed on completion, not on every match mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, match?.complete]);

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />

      {view === 'prologue' && <Prologue onDone={finishPrologue} />}

      {view === 'title' && (
        <Title
          onBegin={() => setView('naming')}
          onCodex={() => openOverlay('codex')}
          onRecords={() => openOverlay('records')}
        />
      )}

      {view === 'naming' && <Naming onBegin={begin} onBack={() => setView('title')} />}

      {view === 'match' && match && (
        <Match
          state={match}
          onChoose={choose}
          onNext={() => setMatch((c) => (c ? nextRound(c) : c))}
          onQuit={() => setView('title')}
          onCodex={() => openOverlay('codex')}
        />
      )}

      {view === 'verdict' && match && (
        <Verdict
          state={match}
          onAgain={() => begin(match.playerName)}
          onTitle={() => setView('title')}
          onRecords={() => openOverlay('records')}
        />
      )}

      {view === 'codex' && <Codex onClose={() => setView(origin)} />}

      {view === 'records' && (
        <Records
          records={records}
          onClose={() => setView(origin)}
          onClear={() => setRecords(clearRecords())}
        />
      )}
    </>
  );
}

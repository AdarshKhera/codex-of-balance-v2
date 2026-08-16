import { useCallback, useEffect, useState } from 'react';
import { Prologue } from './ui/screens/Prologue';
import { Title } from './ui/screens/Title';
import { ModeSelect } from './ui/screens/ModeSelect';
import { Naming } from './ui/screens/Naming';
import { Match } from './ui/screens/Match';
import { ChapterClear } from './ui/screens/ChapterClear';
import { Verdict } from './ui/screens/Verdict';
import { Codex } from './ui/screens/Codex';
import { Records } from './ui/screens/Records';
import { Tutorial } from './ui/screens/Tutorial';
import {
  clearRecords,
  createMatch,
  loadRecords,
  nextRound,
  playRound,
  saveRecord,
  matchOutcome,
  FREE_PLAY_RULES
} from './game/engine';
import type { MatchConfig, MatchState, Record_ } from './game/engine';
import type { ElementId } from './game/elements';
import {
  chapterConfig,
  loadAscent,
  loadLeaderboard,
  recordStoryWin,
  upsertLeaderboard
} from './game/ascent';
import type { AscentProgress, Chapter, LeaderboardEntry } from './game/ascent';

type View =
  | 'prologue'
  | 'title'
  | 'mode'
  | 'naming'
  | 'match'
  | 'chapterClear'
  | 'verdict'
  | 'codex'
  | 'records';

type GameMode = 'story' | 'freeplay';

export default function App() {
  // The prologue opens every launch. It is three lines and a tap dismisses it.
  const [view, setView] = useState<View>('prologue');
  /** Where an overlay screen (codex/records) should return to. */
  const [origin, setOrigin] = useState<View>('title');
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const [mode, setMode] = useState<GameMode>('freeplay');
  const [chapter, setChapter] = useState(1);
  const [ascent, setAscent] = useState<AscentProgress>(loadAscent);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);
  /** Set the instant a Story win advances a chapter; drives the Verdict CTA and ChapterClear. */
  const [justUnlocked, setJustUnlocked] = useState<Chapter | null>(null);

  const [match, setMatch] = useState<MatchState | null>(null);
  const [records, setRecords] = useState<Record_[]>(loadRecords);

  // The atmosphere tints per chapter (see the [data-chapter] rules in
  // global.css) whenever a Story chapter is actually on screen, and reverts
  // to neutral everywhere else, including Free Play.
  useEffect(() => {
    const inStoryFlow = mode === 'story' && ['naming', 'match', 'chapterClear', 'verdict'].includes(view);
    if (inStoryFlow) {
      document.documentElement.dataset.chapter = String(chapter);
    } else {
      delete document.documentElement.dataset.chapter;
    }
  }, [mode, chapter, view]);

  const openOverlay = (target: 'codex' | 'records') => {
    setOrigin(view);
    setView(target);
  };

  const finishPrologue = useCallback(() => setView('title'), []);

  const begin = (name: string) => {
    const config: MatchConfig = mode === 'story' ? chapterConfig(chapter) : FREE_PLAY_RULES;
    setJustUnlocked(null);
    setMatch(createMatch(name, config));
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

    // Free Play never touches the Ascent, only genuine Story wins do.
    if (mode === 'story' && matchOutcome(match) === 'player') {
      const { progress, unlocked } = recordStoryWin(chapter, ascent);
      setAscent(progress);
      setLeaderboard(upsertLeaderboard(match.playerName, progress));
      setJustUnlocked(unlocked);
    }

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
          onBegin={() => setView('mode')}
          onCodex={() => openOverlay('codex')}
          onRecords={() => openOverlay('records')}
          onTutorial={() => setTutorialOpen(true)}
        />
      )}

      {view === 'mode' && (
        <ModeSelect
          highestChapter={ascent.highestChapter}
          onStory={() => {
            setMode('story');
            setChapter(ascent.highestChapter);
            setView('naming');
          }}
          onFreePlay={() => {
            setMode('freeplay');
            setView('naming');
          }}
          onBack={() => setView('title')}
        />
      )}

      {view === 'naming' && (
        <Naming
          config={mode === 'story' ? chapterConfig(chapter) : FREE_PLAY_RULES}
          onBegin={begin}
          onBack={() => setView('mode')}
        />
      )}

      {view === 'match' && match && (
        <Match
          state={match}
          onChoose={choose}
          onNext={() => setMatch((c) => (c ? nextRound(c) : c))}
          onQuit={() => setView('title')}
          onCodex={() => openOverlay('codex')}
        />
      )}

      {view === 'chapterClear' && justUnlocked && (
        <ChapterClear
          chapter={justUnlocked}
          onContinue={() => {
            const finished = justUnlocked.number >= 10;
            setChapter(justUnlocked.number);
            setJustUnlocked(null);
            // Chapter ten has nothing further to unlock, so "Return" goes back
            // to the title rather than straight into another match.
            setView(finished ? 'title' : 'naming');
          }}
        />
      )}

      {view === 'verdict' && match && (
        <Verdict
          state={match}
          onAgain={() => begin(match.playerName)}
          onTitle={() => setView('title')}
          onRecords={() => openOverlay('records')}
          chapterUnlocked={justUnlocked}
          onContinueAscent={() => setView('chapterClear')}
        />
      )}

      {view === 'codex' && <Codex onClose={() => setView(origin)} />}

      {view === 'records' && (
        <Records
          records={records}
          leaderboard={leaderboard}
          onClose={() => setView(origin)}
          onClear={() => setRecords(clearRecords())}
        />
      )}

      {tutorialOpen && (
        <Tutorial
          onClose={() => setTutorialOpen(false)}
          onOpenCodex={() => {
            setTutorialOpen(false);
            openOverlay('codex');
          }}
        />
      )}
    </>
  );
}

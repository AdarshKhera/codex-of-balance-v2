import { useCallback, useEffect, useState } from 'react';
import { Prologue } from './ui/screens/Prologue';
import { Title } from './ui/screens/Title';
import { ModeSelect } from './ui/screens/ModeSelect';
import { Naming } from './ui/screens/Naming';
import { LevelSelect } from './ui/screens/LevelSelect';
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
  RULES,
  FREE_PLAY_RULES
} from './game/engine';
import type { MatchState, Record_ } from './game/engine';
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
  | 'levelSelect'
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
  /** Set once on entering Story, reused for every chapter until you leave Story entirely. */
  const [playerName, setPlayerName] = useState('');
  const [chapter, setChapter] = useState(1);
  const [ascent, setAscent] = useState<AscentProgress>(loadAscent);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);
  /** Set the instant a Story win advances a chapter; drives the Verdict CTA and ChapterClear. */
  const [justUnlocked, setJustUnlocked] = useState<Chapter | null>(null);

  const [match, setMatch] = useState<MatchState | null>(null);
  const [records, setRecords] = useState<Record_[]>(loadRecords);

  // The atmosphere tints per chapter (see the [data-chapter] rules in
  // global.css) whenever a Story chapter is actually on screen, and reverts
  // to neutral everywhere else, including Free Play and the level map.
  useEffect(() => {
    const inChapter = mode === 'story' && (view === 'match' || view === 'chapterClear' || view === 'verdict');
    if (inChapter) {
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

  /** Start a specific chapter's match. Assumes playerName is already set. */
  const beginChapter = (n: number) => {
    setChapter(n);
    setJustUnlocked(null);
    setMatch(createMatch(playerName, chapterConfig(n)));
    setView('match');
  };

  const beginFreePlay = (name: string) => {
    setMatch(createMatch(name, FREE_PLAY_RULES));
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
          rounds={mode === 'story' ? RULES.rounds : FREE_PLAY_RULES.rounds}
          target={mode === 'story' ? RULES.target : FREE_PLAY_RULES.target}
          onBegin={(name) => {
            if (mode === 'story') {
              setPlayerName(name);
              setView('levelSelect');
            } else {
              beginFreePlay(name);
            }
          }}
          onBack={() => setView('mode')}
        />
      )}

      {view === 'levelSelect' && (
        <LevelSelect
          playerName={playerName}
          highestChapter={ascent.highestChapter}
          onSelect={beginChapter}
          onBack={() => setView('title')}
        />
      )}

      {view === 'match' && match && (
        <Match
          state={match}
          onChoose={choose}
          onNext={() => setMatch((c) => (c ? nextRound(c) : c))}
          onQuit={() => setView(mode === 'story' ? 'levelSelect' : 'title')}
          onCodex={() => openOverlay('codex')}
        />
      )}

      {view === 'chapterClear' && justUnlocked && (
        <ChapterClear chapter={justUnlocked} onContinue={() => setView('levelSelect')} />
      )}

      {view === 'verdict' && match && (
        <Verdict
          state={match}
          onAgain={() =>
            mode === 'story' ? beginChapter(chapter) : beginFreePlay(match.playerName)
          }
          onTitle={() => setView(mode === 'story' ? 'levelSelect' : 'title')}
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

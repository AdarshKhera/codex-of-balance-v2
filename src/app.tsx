import { useCallback, useEffect, useState } from 'react';
import { Prologue } from './ui/screens/Prologue';
import { Title } from './ui/screens/Title';
import { ModeSelect } from './ui/screens/ModeSelect';
import { Naming } from './ui/screens/Naming';
import { LevelSelect } from './ui/screens/LevelSelect';
import { StudyScreen } from './ui/screens/StudyScreen';
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
  maxScore,
  nextRound,
  playRound,
  saveRecord,
  starsForScore,
  FREE_PLAY_RULES
} from './game/engine';
import type { MatchState, Record_ } from './game/engine';
import type { ElementId } from './game/elements';
import {
  chapterByNumber,
  chapterConfig,
  loadAscent,
  loadLeaderboard,
  newPairsForChapter,
  recordLevelResult,
  upsertLeaderboard
} from './game/ascent';
import type { AscentProgress, Chapter, LeaderboardEntry } from './game/ascent';

type View =
  | 'prologue'
  | 'title'
  | 'mode'
  | 'naming'
  | 'levelSelect'
  | 'study'
  | 'match'
  | 'chapterClear'
  | 'verdict'
  | 'codex'
  | 'records';

type GameMode = 'story' | 'freeplay';

const TUTORIAL_SEEN_KEY = 'codex.v2.tutorial-seen';

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
  /** Set the instant a Story clear advances a chapter; drives the Verdict CTA and ChapterClear. */
  const [justUnlocked, setJustUnlocked] = useState<Chapter | null>(null);

  const [match, setMatch] = useState<MatchState | null>(null);
  const [records, setRecords] = useState<Record_[]>(loadRecords);

  // The atmosphere tints per chapter (see the [data-chapter] rules in
  // global.css) whenever a Story chapter is actually on screen, and reverts
  // to neutral everywhere else, including Free Play and the level map.
  useEffect(() => {
    const inChapter =
      mode === 'story' && (view === 'study' || view === 'match' || view === 'chapterClear' || view === 'verdict');
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

  // The tutorial opens itself exactly once, the first time anyone ever
  // reaches the title screen. After that it only opens if you tap "How to
  // play" yourself - the goal is a new player is never left guessing what
  // the rules are, without the modal nagging a returning one.
  const finishPrologue = useCallback(() => {
    setView('title');
    if (!localStorage.getItem(TUTORIAL_SEEN_KEY)) {
      localStorage.setItem(TUTORIAL_SEEN_KEY, '1');
      setTutorialOpen(true);
    }
  }, []);

  /** Chosen a chapter on the level map: show what's new before playing it. */
  const openChapter = (n: number) => {
    setChapter(n);
    setJustUnlocked(null);
    setView('study');
  };

  const beginChapter = (n: number) => {
    setMatch(createMatch(playerName, chapterConfig(n)));
    setView('match');
  };

  const beginFreePlay = (name: string) => {
    setMatch(createMatch(name, FREE_PLAY_RULES));
    setView('match');
  };

  const choose = (element: ElementId | 'dragon') => {
    setMatch((current) => (current ? playRound(current, element) : current));
  };

  // A completed match lingers on the final reveal for a beat before the
  // verdict, so the last line still gets read.
  useEffect(() => {
    if (view !== 'match' || !match?.complete) return;
    setRecords((existing) => saveRecord(match, existing));

    // Free Play never touches the Ascent, only genuine Story clears do.
    if (mode === 'story') {
      const cleared = match.status === 'cleared';
      const { progress, unlocked } = recordLevelResult(chapter, match.score, cleared, ascent);
      setAscent(progress);
      setLeaderboard(
        upsertLeaderboard(match.playerName, progress, (ch, score) =>
          starsForScore(score, maxScore(chapterConfig(ch)))
        )
      );
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
          blurb={
            mode === 'story'
              ? 'Each level is its own trial. Learn the pattern, spend wisely, and mind your lives.'
              : `Free Play: the full eighteen, ${FREE_PLAY_RULES.rounds} rounds, one Dragon charge. No lives to lose, just a score to beat.`
          }
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
          bestScore={ascent.bestScore}
          onSelect={openChapter}
          onBack={() => setView('title')}
        />
      )}

      {view === 'study' && (
        <StudyScreen
          chapter={chapterByNumber(chapter)}
          pairs={newPairsForChapter(chapter)}
          onBegin={() => beginChapter(chapter)}
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
          onAgain={() => (mode === 'story' ? beginChapter(chapter) : beginFreePlay(match.playerName))}
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

import { resolve } from './elements';
import type { ElementId } from './elements';
import { LIVES_PER_LEVEL } from './engine';
import type { MatchConfig } from './engine';

/* ============================================================
   The Ascent: ten chapters, elements unlocked in growing batches, the
   Dragon withheld until chapter five, when it arrives as a single
   spendable charge rather than a random draw. See docs/ascent-plan.md and
   docs/mechanics-v3-plan.md for the reasoning behind the ordering, the
   round counts, and the Dragon change.
   ============================================================ */

export interface Chapter {
  number: number; // 1-10
  name: string;
  /** Elements this chapter adds. Empty once the roster is full (9) or it's the Dragon chapter (10). */
  adds: ElementId[];
  /** The "why this pair" line, shown on the chapter-clear screen. */
  blurb: string;
  rounds: number;
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    name: 'Instinct',
    adds: ['fire', 'water', 'life', 'void'],
    blurb: 'The rawest forces. Heat and flow, something and nothing. Before there is a self, there is this.',
    rounds: 3
  },
  {
    number: 2,
    name: 'Perception',
    adds: ['light', 'stone'],
    blurb: 'What reveals, and what refuses to move. Insight and stubbornness.',
    rounds: 4
  },
  {
    number: 3,
    name: 'Reaction',
    adds: ['ice', 'lightning'],
    blurb: 'Stillness and sudden force. Two opposite ways of responding when something happens to you.',
    rounds: 6
  },
  {
    number: 4,
    name: 'Inwardness',
    adds: ['mind', 'spirit'],
    blurb: 'Thought and intuition. The first elements that live inside you rather than around you.',
    rounds: 8
  },
  {
    number: 5,
    name: 'Design',
    adds: ['order', 'chaos'],
    blurb: 'How you organize the world, and how the world refuses to stay organized.',
    rounds: 10
  },
  {
    number: 6,
    name: 'Reckoning',
    adds: ['time', 'death'],
    blurb: 'What erodes, and what ends. The heaviest chapter, on purpose.',
    rounds: 10
  },
  {
    number: 7,
    name: 'The Unseen',
    adds: ['dream', 'mist'],
    blurb: "What's felt but not provable. The unconscious, the half-seen.",
    rounds: 10
  },
  {
    number: 8,
    name: 'Judgment',
    adds: ['balance', 'mask'],
    blurb: 'How you weigh what you have learned, and the face you show while doing it. The last of the eighteen.',
    rounds: 10
  },
  {
    number: 9,
    name: 'Communion',
    adds: [],
    blurb: 'Nothing left to add. Only to prove, once more, that you have actually learned it.',
    rounds: 10
  },
  {
    number: 10,
    name: 'The Undeniable',
    adds: [],
    blurb: "Nine chapters, and every choice was yours to weigh. This one isn't.",
    rounds: 10
  }
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function romanNumeral(chapter: number): string {
  return ROMAN[chapter - 1] ?? String(chapter);
}

export function chapterByNumber(n: number): Chapter {
  return CHAPTERS[n - 1] ?? CHAPTERS[0];
}

/** Every element unlocked by the end of the given chapter. */
export function elementsThroughChapter(n: number): ElementId[] {
  return CHAPTERS.filter((c) => c.number <= n).flatMap((c) => c.adds);
}

/** The Dragon arrives as a spendable charge from chapter five on. */
export function dragonUnlockedAt(n: number): boolean {
  return n >= 5;
}

/** The match config for playing a given chapter of the Ascent. */
export function chapterConfig(n: number): MatchConfig {
  const chapter = chapterByNumber(n);
  return {
    pool: elementsThroughChapter(n),
    rounds: chapter.rounds,
    dragonAvailable: dragonUnlockedAt(n),
    livesLimit: LIVES_PER_LEVEL
  };
}

/* ============================================================
   The study screen: only the relationships a chapter actually introduces,
   never the whole table. A pair between two elements this chapter adds, or
   between a new element and anything unlocked before it.
   ============================================================ */

export interface StudyPair {
  a: ElementId;
  b: ElementId;
  /** null = the pair ties */
  winner: ElementId | null;
  line: string;
}

export function newPairsForChapter(n: number): StudyPair[] {
  const chapter = chapterByNumber(n);
  const added = chapter.adds;
  if (added.length === 0) return [];

  const prior = elementsThroughChapter(n - 1);
  const pair = (a: ElementId, b: ElementId): StudyPair => {
    const r = resolve(a, b);
    return { a, b, winner: r.outcome === 'tie' ? null : r.outcome === 'win' ? a : b, line: r.line };
  };

  const pairs: StudyPair[] = [];
  for (let i = 0; i < added.length; i++) {
    for (let j = i + 1; j < added.length; j++) pairs.push(pair(added[i], added[j]));
  }
  for (const a of added) {
    for (const p of prior) pairs.push(pair(a, p));
  }
  return pairs;
}

/* ============================================================
   Progress. A chapter only advances on a genuine clear, and only when it
   was the frontier chapter, which is what makes the leaderboard below
   trustworthy: see docs/mechanics-v3-plan.md, "Leaderboard".
   ============================================================ */

export interface AscentProgress {
  /** Highest chapter currently unlocked and playable. Starts at 1. */
  highestChapter: number;
  /** Best score ever recorded on a cleared attempt of each chapter. */
  bestScore: Record<number, number>;
}

const ASCENT_KEY = 'codex.v2.ascent';

export function loadAscent(): AscentProgress {
  try {
    const raw = localStorage.getItem(ASCENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AscentProgress>;
      return { highestChapter: parsed.highestChapter ?? 1, bestScore: parsed.bestScore ?? {} };
    }
  } catch {
    /* corrupt or unavailable storage falls through to a fresh start */
  }
  return { highestChapter: 1, bestScore: {} };
}

function saveAscent(progress: AscentProgress) {
  try {
    localStorage.setItem(ASCENT_KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked, the in-memory value still updates */
  }
}

export function totalScore(progress: AscentProgress): number {
  return Object.values(progress.bestScore).reduce((sum, s) => sum + s, 0);
}

/**
 * Call once, after a Story match ends. Only a genuine clear updates anything.
 * Returns the new progress and the chapter that was just unlocked, or null if
 * this clear didn't advance anything (a replay of an already-cleared chapter,
 * or chapter ten, which has nothing further to unlock).
 */
export function recordLevelResult(
  chapter: number,
  score: number,
  cleared: boolean,
  progress: AscentProgress
): { progress: AscentProgress; unlocked: Chapter | null } {
  if (!cleared) return { progress, unlocked: null };

  const prevBest = progress.bestScore[chapter] ?? 0;
  const bestScore = { ...progress.bestScore, [chapter]: Math.max(prevBest, score) };
  const advances = chapter === progress.highestChapter && progress.highestChapter < 10;
  const highestChapter = advances ? progress.highestChapter + 1 : progress.highestChapter;

  const next: AscentProgress = { highestChapter, bestScore };
  saveAscent(next);
  return { progress: next, unlocked: advances ? chapterByNumber(highestChapter) : null };
}

/* ============================================================
   Leaderboard: local, name-keyed, ranked by total score across every
   chapter's best attempt, tiebroken by total stars. Free Play never
   touches this, by design.
   ============================================================ */

export interface LeaderboardEntry {
  name: string;
  highestChapter: number;
  totalScore: number;
  totalStars: number;
  lastPlayed: string;
}

const LEADERBOARD_KEY = 'codex.v2.leaderboard';

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (raw) return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    /* ignore */
  }
  return [];
}

export function upsertLeaderboard(
  name: string,
  progress: AscentProgress,
  starsFor: (chapter: number, score: number) => number
): LeaderboardEntry[] {
  const existing = loadLeaderboard().filter((e) => e.name !== name);
  const totalStars = Object.entries(progress.bestScore).reduce(
    (sum, [chapter, score]) => sum + starsFor(Number(chapter), score),
    0
  );
  const entry: LeaderboardEntry = {
    name,
    highestChapter: progress.highestChapter,
    totalScore: totalScore(progress),
    totalStars,
    lastPlayed: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  };
  const next = [...existing, entry].sort(
    (a, b) => b.totalScore - a.totalScore || b.totalStars - a.totalStars
  );
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

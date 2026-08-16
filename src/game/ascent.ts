import type { ElementId } from './elements';
import type { MatchConfig } from './engine';

/* ============================================================
   The Ascent: ten chapters, elements unlocked two at a time, the Dragon
   withheld until the last one. See docs/ascent-plan.md for the reasoning
   behind the ordering and behind holding the Dragon back.
   ============================================================ */

export interface Chapter {
  number: number; // 1-10
  name: string;
  /** Elements this chapter adds. Empty for chapter ten: it adds the Dragon instead. */
  adds: ElementId[];
  /** The "why this pair" line, shown on the chapter-clear screen. */
  blurb: string;
}

export const CHAPTERS: Chapter[] = [
  {
    number: 1,
    name: 'Instinct',
    adds: ['fire', 'water'],
    blurb: 'The first two things anything feels: heat and flow, urgency and yielding.'
  },
  {
    number: 2,
    name: 'Presence',
    adds: ['life', 'void'],
    blurb: 'Something and nothing. The self begins in the gap between having and lacking.'
  },
  {
    number: 3,
    name: 'Perception',
    adds: ['light', 'stone'],
    blurb: 'What reveals, and what refuses to move. Insight and stubbornness.'
  },
  {
    number: 4,
    name: 'Reaction',
    adds: ['ice', 'lightning'],
    blurb: 'Stillness and sudden force. Two opposite ways of responding when something happens to you.'
  },
  {
    number: 5,
    name: 'Inwardness',
    adds: ['mind', 'spirit'],
    blurb: 'Thought and intuition. The first elements that live inside you rather than around you.'
  },
  {
    number: 6,
    name: 'Design',
    adds: ['order', 'chaos'],
    blurb: 'How you organize the world, and how the world refuses to stay organized.'
  },
  {
    number: 7,
    name: 'Reckoning',
    adds: ['time', 'death'],
    blurb: "What erodes, and what ends. The heaviest chapter, on purpose."
  },
  {
    number: 8,
    name: 'The Unseen',
    adds: ['dream', 'mist'],
    blurb: "What's felt but not provable. The unconscious, the half-seen."
  },
  {
    number: 9,
    name: 'Judgment',
    adds: ['balance', 'mask'],
    blurb: 'How you weigh what you have learned, and the face you show while doing it.'
  },
  {
    number: 10,
    name: 'The Undeniable',
    adds: [],
    blurb: "Nine chapters, and every choice was yours to weigh. This one isn't."
  }
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export function romanNumeral(chapter: number): string {
  return ROMAN[chapter - 1] ?? String(chapter);
}

export function chapterByNumber(n: number): Chapter {
  return CHAPTERS[n - 1] ?? CHAPTERS[0];
}

/** Every element unlocked by the end of the given chapter (Dragon excluded; see below). */
export function elementsThroughChapter(n: number): ElementId[] {
  return CHAPTERS.filter((c) => c.number <= n).flatMap((c) => c.adds);
}

/** The match config for playing a given chapter of the Ascent. */
export function chapterConfig(n: number): MatchConfig {
  const isFinal = n >= 10;
  return {
    pool: elementsThroughChapter(n),
    rounds: 10,
    target: 6,
    // The Dragon sits out of every chapter except the last. See
    // docs/ascent-plan.md, "Chapter X: the Dragon, held back until here".
    dragonSpawn: isFinal ? 0.25 : 0,
    dragonOpponentUse: 0.35
  };
}

/* ============================================================
   Progress. Only a genuine Story win ever changes this, and only the
   frontier chapter (the one currently unlocked) can advance it further,
   which is what makes the leaderboard below trustworthy: see
   docs/ascent-plan.md, "Scoring and the leaderboard".
   ============================================================ */

export interface AscentProgress {
  /** Highest chapter currently unlocked and playable. Starts at 1. */
  highestChapter: number;
  /** Every Story win, at any chapter, including replays. The leaderboard tiebreaker. */
  lifetimeWins: number;
}

const ASCENT_KEY = 'codex.v2.ascent';

export function loadAscent(): AscentProgress {
  try {
    const raw = localStorage.getItem(ASCENT_KEY);
    if (raw) return JSON.parse(raw) as AscentProgress;
  } catch {
    /* corrupt or unavailable storage falls through to a fresh start */
  }
  return { highestChapter: 1, lifetimeWins: 0 };
}

function saveAscent(progress: AscentProgress) {
  try {
    localStorage.setItem(ASCENT_KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked, the in-memory value still updates */
  }
}

/**
 * Call once, after a Story match ends in a win. Returns the new progress and
 * the chapter that was just unlocked, or null if this win didn't advance
 * anything (a replay of an already-cleared chapter, or chapter ten, which has
 * nothing further to unlock).
 */
export function recordStoryWin(
  chapterPlayed: number,
  progress: AscentProgress
): { progress: AscentProgress; unlocked: Chapter | null } {
  const advances = chapterPlayed === progress.highestChapter && progress.highestChapter < 10;
  const next: AscentProgress = {
    highestChapter: advances ? progress.highestChapter + 1 : progress.highestChapter,
    lifetimeWins: progress.lifetimeWins + 1
  };
  saveAscent(next);
  return { progress: next, unlocked: advances ? chapterByNumber(next.highestChapter) : null };
}

/* ============================================================
   Leaderboard: local, name-keyed, sorted by chapter reached then wins.
   Free Play never touches this, by design.
   ============================================================ */

export interface LeaderboardEntry {
  name: string;
  highestChapter: number;
  lifetimeWins: number;
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

export function upsertLeaderboard(name: string, progress: AscentProgress): LeaderboardEntry[] {
  const existing = loadLeaderboard().filter((e) => e.name !== name);
  const entry: LeaderboardEntry = {
    name,
    highestChapter: progress.highestChapter,
    lifetimeWins: progress.lifetimeWins,
    lastPlayed: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  };
  const next = [...existing, entry].sort(
    (a, b) => b.highestChapter - a.highestChapter || b.lifetimeWins - a.lifetimeWins
  );
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

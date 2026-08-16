import { CORE_ELEMENTS, DRAGON, resolve } from './elements';
import type { ElementId, Outcome, RoundResult } from './elements';

/* ============================================================
   Match rules, v3.

   The old model had both sides choose blind and simultaneously, which meant
   no round ever had a genuinely correct answer to find, and against a random
   opponent the single best strategy was always "play whichever element wins
   the most pairs overall" - a solved game dressed up as a guessing game.

   Now the opponent reveals first. You answer knowing what you're answering
   to, which is what turns "do I remember the table" into an actual decision:
   every element is single-use for the rest of the level, so the question is
   never just "what beats this" but "what beats this, and can I afford to
   spend it here." See docs/mechanics-v3-plan.md for the full reasoning.
   ============================================================ */

export interface MatchConfig {
  /** The elements in play this level, never including the Dragon. */
  pool: ElementId[];
  rounds: number;
  /** True from chapter five on: a single Dragon charge is available this level. */
  dragonAvailable: boolean;
  /** Free Play only: matches never end from running out of lives. */
  livesLimit: number;
}

export const RULES = {
  target: 6, // legacy display value, unused by the engine itself
  rounds: 10
};

/** Free Play: full roster, longer run, a Dragon charge, can't fail out. */
export const FREE_PLAY_RULES: MatchConfig = {
  pool: CORE_ELEMENTS,
  rounds: 15,
  dragonAvailable: true,
  livesLimit: Infinity
};

/** Points for beating, tying, or losing a single round. */
export const POINTS = { win: 3, tie: 1, lose: 0 } as const;

export const LIVES_PER_LEVEL = 3;

export type MatchStatus = 'playing' | 'cleared' | 'failed';

export interface MatchState {
  playerName: string;
  config: MatchConfig;
  /** The opponent's full sequence for this level, decided once at the start
   *  so the UI can show what's coming next, not just what's here now. */
  opponentQueue: ElementId[];
  roundIndex: number;
  /** Elements the player hasn't spent yet this level. */
  hand: ElementId[];
  dragonUsed: boolean;
  score: number;
  lives: number;
  /** Result of the round just played; null while choosing. */
  round: RoundResult | null;
  history: Outcome[];
  startedAt: number;
  endedAt: number | null;
  complete: boolean;
  status: MatchStatus;
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createMatch(playerName: string, config: MatchConfig): MatchState {
  return {
    playerName,
    config,
    opponentQueue: shuffled(config.pool).slice(0, config.rounds),
    roundIndex: 0,
    hand: config.pool,
    dragonUsed: false,
    score: 0,
    lives: config.livesLimit,
    round: null,
    history: [],
    startedAt: Date.now(),
    endedAt: null,
    complete: false,
    status: 'playing'
  };
}

/** What the player can currently see: this round's ask, and the next two queued. */
export function upcoming(state: MatchState): { current: ElementId; next: ElementId[] } {
  return {
    current: state.opponentQueue[state.roundIndex],
    next: state.opponentQueue.slice(state.roundIndex + 1, state.roundIndex + 3)
  };
}

export function dragonReady(state: MatchState): boolean {
  return state.config.dragonAvailable && !state.dragonUsed;
}

/**
 * Play one round. `choice` is either an element still in hand, or the literal
 * 'dragon' to spend this level's one Dragon charge. Both are resolved through
 * the same matchup table as always - the Dragon just isn't in anyone's hand
 * by default, it's a separate one-shot option layered on top.
 */
export function playRound(state: MatchState, choice: ElementId | 'dragon'): MatchState {
  if (state.complete || state.round) return state;
  if (choice === 'dragon' && !dragonReady(state)) return state;
  if (choice !== 'dragon' && !state.hand.includes(choice)) return state;

  const opponentChoice = state.opponentQueue[state.roundIndex];
  const playerChoice = choice === 'dragon' ? DRAGON : choice;
  const round = resolve(playerChoice, opponentChoice);

  const score = state.score + POINTS[round.outcome];
  const lives = round.outcome === 'lose' ? state.lives - 1 : state.lives;
  const roundIndex = state.roundIndex + 1;

  const failed = lives <= 0;
  const finishedRounds = roundIndex >= state.config.rounds;
  const complete = failed || finishedRounds;

  return {
    ...state,
    round,
    history: [...state.history, round.outcome],
    hand: choice === 'dragon' ? state.hand : state.hand.filter((e) => e !== choice),
    dragonUsed: choice === 'dragon' ? true : state.dragonUsed,
    score,
    lives,
    roundIndex,
    complete,
    status: failed ? 'failed' : finishedRounds ? 'cleared' : 'playing',
    endedAt: complete ? Date.now() : null
  };
}

/** Clear the reveal so the next round can be chosen. No-op once the match is over. */
export function nextRound(state: MatchState): MatchState {
  if (state.complete) return state;
  return { ...state, round: null };
}

export function maxScore(config: MatchConfig): number {
  return config.rounds * POINTS.win;
}

/** 1-3 stars by percentage of a possible score. Cleared levels always earn at least one. */
export function starsForScore(score: number, max: number): number {
  const pct = score / max;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  return 1;
}

export function starsEarned(state: MatchState): number {
  if (state.status !== 'cleared') return 0;
  return starsForScore(state.score, maxScore(state.config));
}

export function elapsed(state: MatchState): string {
  const ms = (state.endedAt ?? Date.now()) - state.startedAt;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ============================================================
   Records: a simple recent-matches log, unrelated to Ascent scoring.
   ============================================================ */

export interface Record_ {
  name: string;
  score: string;
  margin: number;
  duration: string;
  date: string;
}

const RECORDS_KEY = 'codex.v2.records';

export function loadRecords(): Record_[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as Record_[]) : [];
  } catch {
    return [];
  }
}

export function saveRecord(state: MatchState, existing: Record_[]): Record_[] {
  const entry: Record_ = {
    name: state.playerName,
    score: `${state.score} pts`,
    margin: state.score,
    duration: elapsed(state),
    date: new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  };
  const next = [entry, ...existing].sort((a, b) => b.margin - a.margin).slice(0, 10);
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked, the in-memory list still updates */
  }
  return next;
}

export function clearRecords(): Record_[] {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

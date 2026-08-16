import { CORE_ELEMENTS, DRAGON, resolve } from './elements';
import type { ElementId, Outcome, RoundResult } from './elements';

/* ============================================================
   Match rules, as data. v1 buried these as literals inside a component,
   which is how "first to 6" and "best of 10" drifted apart in the scoring
   maths. One place, named, testable.
   ============================================================ */

/**
 * A match's rules are now data passed in rather than one fixed global, so
 * Story (10 rounds, a growing element pool, Dragon withheld until chapter
 * ten) and Free Play (20 rounds, everything unlocked) can share this exact
 * engine instead of forking it.
 */
export interface MatchConfig {
  /** The elements in play, never including the Dragon. */
  pool: ElementId[];
  rounds: number;
  target: number;
  /** Chance the Dragon is offered at the start of a round. 0 = withheld. */
  dragonSpawn: number;
  /** If the Dragon is on the table, how often the opponent reaches for it too. */
  dragonOpponentUse: number;
}

/**
 * The default, full-roster ruleset. Story's early chapters build their own
 * config with a smaller pool and the Dragon withheld (see game/ascent.ts);
 * this is what Codex and Tutorial quote as "how the game normally works",
 * and what a chapter ten / freshly-started match falls back to.
 */
export const RULES: MatchConfig = {
  pool: CORE_ELEMENTS,
  rounds: 10,
  target: 6,
  /**
   * At 0.15 opponent-contest the old default let a player who simply always
   * took the Dragon win about 77% of matches. 0.35 puts a real match at
   * roughly 65%: winnable, but not automatic.
   */
  dragonSpawn: 0.25,
  dragonOpponentUse: 0.35
};

/** Free Play: everything unlocked, no progression, a longer match. */
export const FREE_PLAY_RULES: MatchConfig = {
  ...RULES,
  rounds: 20,
  target: 11
};

export type MatchOutcome = 'player' | 'opponent' | 'draw';

export interface MatchState {
  playerName: string;
  config: MatchConfig;
  playerScore: number;
  opponentScore: number;
  roundsPlayed: number;
  /** Elements offered this round: config.pool, plus the Dragon when it spawns. */
  hand: ElementId[];
  /** Result of the round just played; null while choosing. */
  round: RoundResult | null;
  /** Outcome of every round so far, in order, drives the progress pips. */
  history: Outcome[];
  startedAt: number;
  endedAt: number | null;
  complete: boolean;
}

function dealHand(config: MatchConfig): ElementId[] {
  // The Dragon leads the hand when it appears. Tacked on the end it read as an
  // afterthought stranded on its own row.
  return Math.random() < config.dragonSpawn ? [DRAGON, ...config.pool] : config.pool;
}

export function createMatch(playerName: string, config: MatchConfig = RULES): MatchState {
  return {
    playerName,
    config,
    playerScore: 0,
    opponentScore: 0,
    roundsPlayed: 0,
    hand: dealHand(config),
    round: null,
    history: [],
    startedAt: Date.now(),
    endedAt: null,
    complete: false
  };
}

function chooseForOpponent(hand: ElementId[], config: MatchConfig): ElementId {
  if (hand.includes(DRAGON) && Math.random() < config.dragonOpponentUse) return DRAGON;
  const pool = hand.filter((e) => e !== DRAGON);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Play one round. Returns a new state with the round resolved and the score
 * already updated, the score and the result can never disagree, which was the
 * root of v1's "you reached 6 but lost" bug.
 */
export function playRound(state: MatchState, choice: ElementId): MatchState {
  if (state.complete || state.round) return state;

  const round = resolve(choice, chooseForOpponent(state.hand, state.config));
  const playerScore = state.playerScore + (round.outcome === 'win' ? 1 : 0);
  const opponentScore = state.opponentScore + (round.outcome === 'lose' ? 1 : 0);
  const roundsPlayed = state.roundsPlayed + 1;

  // A tie still consumes a round, so this must be checked on every outcome.
  const complete =
    playerScore >= state.config.target ||
    opponentScore >= state.config.target ||
    roundsPlayed >= state.config.rounds;

  return {
    ...state,
    round,
    history: [...state.history, round.outcome],
    playerScore,
    opponentScore,
    roundsPlayed,
    complete,
    endedAt: complete ? Date.now() : null
  };
}

/** Clear the reveal and deal a fresh hand. No-op once the match is over. */
export function nextRound(state: MatchState): MatchState {
  if (state.complete) return state;
  return { ...state, round: null, hand: dealHand(state.config) };
}

export function matchOutcome(state: MatchState): MatchOutcome {
  if (state.playerScore === state.opponentScore) return 'draw';
  return state.playerScore > state.opponentScore ? 'player' : 'opponent';
}

export function elapsed(state: MatchState): string {
  const ms = (state.endedAt ?? Date.now()) - state.startedAt;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ============================================================
   Records
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
    // Corrupt or unavailable storage must never take the game down with it.
    return [];
  }
}

export function saveRecord(state: MatchState, existing: Record_[]): Record_[] {
  const entry: Record_ = {
    name: state.playerName,
    score: `${state.playerScore}-${state.opponentScore}`,
    margin: state.playerScore - state.opponentScore,
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

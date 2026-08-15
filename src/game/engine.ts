import { CORE_ELEMENTS, DRAGON, resolve } from './elements';
import type { ElementId, Outcome, RoundResult } from './elements';

/* ============================================================
   Match rules, as data. v1 buried these as literals inside a component,
   which is how "first to 6" and "best of 10" drifted apart in the scoring
   maths. One place, named, testable.
   ============================================================ */

export const RULES = {
  rounds: 10,
  target: 6,
  /** Chance the Dragon is offered at the start of a round. */
  dragonSpawn: 0.25,
  /**
   * If the Dragon is on the table, how often the opponent reaches for it too.
   * At the old 0.15 the opponent almost never contested it, so simply taking
   * the Dragon every time it appeared won about 77% of matches. Raising this
   * puts a real match at roughly 65%: winnable, but not automatic.
   */
  dragonOpponentUse: 0.35
} as const;

export type MatchOutcome = 'player' | 'opponent' | 'draw';

export interface MatchState {
  playerName: string;
  playerScore: number;
  opponentScore: number;
  roundsPlayed: number;
  /** Elements offered this round, 18, or 19 when the Dragon appears. */
  hand: ElementId[];
  /** Result of the round just played; null while choosing. */
  round: RoundResult | null;
  /** Outcome of every round so far, in order, drives the progress pips. */
  history: Outcome[];
  startedAt: number;
  endedAt: number | null;
  complete: boolean;
}

function dealHand(): ElementId[] {
  // The Dragon leads the hand when it appears. Tacked on the end it read as an
  // afterthought stranded on its own row.
  return Math.random() < RULES.dragonSpawn ? [DRAGON, ...CORE_ELEMENTS] : CORE_ELEMENTS;
}

export function createMatch(playerName: string): MatchState {
  return {
    playerName,
    playerScore: 0,
    opponentScore: 0,
    roundsPlayed: 0,
    hand: dealHand(),
    round: null,
    history: [],
    startedAt: Date.now(),
    endedAt: null,
    complete: false
  };
}

function chooseForOpponent(hand: ElementId[]): ElementId {
  if (hand.includes(DRAGON) && Math.random() < RULES.dragonOpponentUse) return DRAGON;
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

  const round = resolve(choice, chooseForOpponent(state.hand));
  const playerScore = state.playerScore + (round.outcome === 'win' ? 1 : 0);
  const opponentScore = state.opponentScore + (round.outcome === 'lose' ? 1 : 0);
  const roundsPlayed = state.roundsPlayed + 1;

  // A tie still consumes a round, so this must be checked on every outcome.
  const complete =
    playerScore >= RULES.target ||
    opponentScore >= RULES.target ||
    roundsPlayed >= RULES.rounds;

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
  return { ...state, round: null, hand: dealHand() };
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

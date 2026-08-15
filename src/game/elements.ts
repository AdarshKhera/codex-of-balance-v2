/* ============================================================
   The elemental system.

   Every matchup is authored exactly once, as an unordered pair, and both
   directions are derived from it. That makes it impossible for the table to
   contradict itself (A beating B while B also beats A) and makes a missing
   pair loud rather than silent, see the completeness assert at the bottom.
   ============================================================ */

export type ElementId =
  | 'void' | 'light' | 'water' | 'fire' | 'life' | 'lightning'
  | 'ice' | 'mind' | 'chaos' | 'spirit' | 'time' | 'order'
  | 'stone' | 'mist' | 'balance' | 'dream' | 'death' | 'mask'
  | 'dragon';

export const DRAGON: ElementId = 'dragon';

/** The 18 elements a player can draw from. Dragon is granted, never listed. */
export const CORE_ELEMENTS: ElementId[] = [
  'void', 'light', 'water', 'fire', 'life', 'lightning',
  'ice', 'mind', 'chaos', 'spirit', 'time', 'order',
  'stone', 'mist', 'balance', 'dream', 'death', 'mask'
];

export const ELEMENT_NAME: Record<ElementId, string> = {
  void: 'Void',
  light: 'Light',
  water: 'Water',
  fire: 'Fire',
  life: 'Life',
  lightning: 'Lightning',
  ice: 'Ice',
  mind: 'Mind',
  chaos: 'Chaos',
  spirit: 'Spirit',
  time: 'Time',
  order: 'Order',
  stone: 'Stone',
  mist: 'Mist',
  balance: 'Balance',
  dream: 'Dream',
  death: 'Death',
  mask: 'Mask',
  // Kept to one word so it occupies the same single line as every other label
  // in the hand grid. The Codex spells out the full title.
  dragon: 'Dragon'
};

export const DRAGON_FULL_NAME = 'The Sacred Dragon';

/** One-line character notes, shown in the Codex index. */
export const ELEMENT_NOTE: Record<ElementId, string> = {
  void: 'The absence that everything is measured against.',
  light: 'Reveals, and in revealing, judges.',
  water: 'Wins by refusing to hold a shape.',
  fire: 'Spends itself completely, every time.',
  life: 'Insists, quietly, without arguing.',
  lightning: 'Arrives before the thought of it.',
  ice: 'Stops the world rather than answer it.',
  mind: 'Builds the map, then trusts it too far.',
  chaos: 'Cannot be planned for, only survived.',
  spirit: 'The part of you that was never negotiable.',
  time: 'Undefeated, eventually.',
  order: 'What remains after the storm is catalogued.',
  stone: 'Says no, and keeps saying it.',
  mist: 'Wins by making the question unanswerable.',
  balance: 'Holds two true things without breaking.',
  dream: 'The logic underneath the logic.',
  death: 'Not cruelty. Only the last full stop.',
  mask: 'Becomes whatever survives the room.',
  dragon: 'Older than the argument. Ends it.'
};

type Pair = [ElementId, ElementId, string];

/** [winner, loser, line] */
const VICTORIES: Pair[] = [
  ['light', 'void', 'A single photon breaks infinite darkness.'],
  ['void', 'fire', 'Flames hunger for fuel. Void offers none.'],
  ['life', 'void', 'Life insists on existing.'],
  ['void', 'mind', 'Thought cannot grasp the infinite emptiness.'],
  ['spirit', 'void', 'Even in emptiness, the soul stirs.'],
  ['time', 'void', 'Even nothing decays.'],
  ['order', 'void', 'Structure over silence.'],
  ['water', 'light', 'Light gives out long before it reaches the floor.'],
  ['light', 'life', 'Too much light scorches the leaves.'],
  ['lightning', 'light', 'Faster than vision.'],
  ['light', 'ice', 'Warmth returns, and the frost recedes.'],
  ['chaos', 'light', 'Chaos fractures the beam.'],
  ['water', 'fire', 'Steam rises. Fire dies.'],
  ['life', 'water', 'Roots drink rivers.'],
  ['water', 'lightning', 'Water does not fight lightning. It redirects it.'],
  ['ice', 'water', 'Cold wins. Flow stops.'],
  ['time', 'water', 'Rivers cut valleys with patience.'],
  ['water', 'order', 'Order cannot bind the sea.'],
  ['fire', 'life', 'Wood feeds the flame.'],
  ['fire', 'ice', 'Cold shatters in heat.'],
  ['mind', 'fire', 'Strategy starves fury.'],
  ['fire', 'chaos', 'Uncontrolled, unpredictable, and still flammable.'],
  ['spirit', 'fire', 'Passion without purpose consumes itself.'],
  ['time', 'fire', 'All flames flicker out.'],
  ['order', 'fire', 'A controlled burn does not destroy.'],
  ['life', 'lightning', 'Nature grounds power.'],
  ['ice', 'life', 'Sap freezes. Bark cracks.'],
  ['mind', 'life', 'Thought prunes growth.'],
  ['life', 'time', 'Growth outpaces decay.'],
  ['lightning', 'ice', 'Shatter through stillness.'],
  ['lightning', 'mind', 'Faster than thought.'],
  ['lightning', 'spirit', 'Spirit whispers, but lightning shouts.'],
  ['lightning', 'time', 'Lightning strikes faster than time can measure.'],
  ['order', 'lightning', 'A lightning rod gives direction.'],
  ['ice', 'chaos', 'Even chaos slows when frozen.'],
  ['spirit', 'ice', 'Stillness does not mean lifelessness.'],
  ['order', 'ice', 'Crystal symmetry.'],
  ['chaos', 'mind', 'No plan survives disorder.'],
  ['time', 'mind', 'Memories fade.'],
  ['chaos', 'spirit', 'Randomness deafens intuition.'],
  ['chaos', 'time', 'Chaos breaks the clock.'],
  ['order', 'chaos', 'Structure survives storms.'],
  ['spirit', 'time', 'The soul remembers beyond clocks.'],
  ['order', 'spirit', 'A caged soul is a silent one.'],
  ['time', 'order', 'Even the perfect breaks down.'],
  ['stone', 'void', 'Something is heavier than nothing.'],
  ['water', 'stone', 'Patience carves the mountain.'],
  ['stone', 'fire', 'Fire finds nothing to eat in rock.'],
  ['life', 'stone', 'Roots split the boulder.'],
  ['stone', 'lightning', 'The mountain takes the strike and stands.'],
  ['ice', 'stone', 'Water in the crack, and the cliff comes down.'],
  ['mind', 'stone', 'The lever finds what force never could.'],
  ['stone', 'chaos', 'Storms pass. Stone remains.'],
  ['stone', 'spirit', 'The mountain does not listen.'],
  ['time', 'stone', 'Every mountain is a slower river.'],
  ['light', 'mist', 'Morning burns the veil away.'],
  ['fire', 'mist', 'Heat drinks the fog.'],
  ['mist', 'lightning', 'The bolt finds nothing to strike.'],
  ['mist', 'mind', 'No map survives a fog.'],
  ['mist', 'chaos', 'Even disorder loses its edges here.'],
  ['time', 'mist', 'Every fog lifts by noon.'],
  ['mist', 'order', 'No border holds in the fog.'],
  ['void', 'balance', 'The scale has nothing to weigh.'],
  ['balance', 'fire', 'Temperance outlasts fury.'],
  ['balance', 'lightning', 'Measure survives the sudden.'],
  ['balance', 'ice', 'Even stillness must be weighed.'],
  ['balance', 'chaos', 'The scale steadies what the storm scatters.'],
  ['spirit', 'balance', 'The soul refuses the scale.'],
  ['time', 'balance', 'Every scale tips eventually.'],
  ['balance', 'order', 'Justice sits above the law.'],
  ['mind', 'balance', 'Someone has to decide what the scale is measuring.'],
  ['dream', 'void', 'Even nothing dreams.'],
  ['light', 'dream', 'Dawn ends every dream.'],
  ['fire', 'dream', 'Heat wakes the sleeper.'],
  ['lightning', 'dream', 'The shock wakes you.'],
  ['dream', 'mind', 'Beneath the argument, the sleeping thing.'],
  ['dream', 'time', 'There are no clocks in sleep.'],
  ['dream', 'order', 'No law survives the sleeping mind.'],
  ['light', 'death', 'Every night ends in dawn.'],
  ['death', 'lightning', 'The strike ends. The ending remains.'],
  ['death', 'ice', 'Preservation is not survival.'],
  ['chaos', 'death', 'Disorder outlives every ending.'],
  ['spirit', 'death', 'The soul walks out the other side.'],
  ['order', 'death', 'What is written outlives the writer.'],
  ['void', 'mask', 'Emptiness has no one to fool.'],
  ['light', 'mask', 'Truth needs no performance.'],
  ['fire', 'mask', 'Heat gets under the paint.'],
  ['mask', 'life', 'Artifice grows where nature would not.'],
  ['ice', 'mask', 'Hold a smile long enough and it freezes.'],
  ['mask', 'mind', 'The clever are the easiest to fool.'],
  ['mask', 'chaos', 'Even disorder can be performed.'],
  ['spirit', 'mask', 'The soul sees the face behind the face.'],
  ['time', 'mask', 'Every mask slips eventually.'],
  ['mask', 'order', 'The law reads the face it is shown.'],
  ['stone', 'mist', 'The mountain does not care what hides it.'],
  ['dream', 'stone', 'In sleep the mountain walks.'],
  ['stone', 'death', 'The monument outlasts the buried.'],
  ['stone', 'mask', 'Stone wears no face.'],
  ['mist', 'balance', 'You cannot weigh what you cannot see.'],
  ['death', 'mist', 'The fog lifts. The ending does not.'],
  ['balance', 'dream', 'Judgement wakes the dreamer.'],
  ['death', 'balance', 'The last weight is always the same.'],
  ['mask', 'balance', 'The scale cannot weigh a lie.'],
  ['mask', 'dream', 'Wear it long enough and the dream believes it too.'],
  ['death', 'mask', 'No one is in costume at the end.'],

  // Tuning pass: pairs that used to stalemate, given a decisive result so a
  // match resolves more often than it draws.
  ['mind', 'light', 'Light shows the room. Mind decides what it meant.'],
  ['mind', 'water', 'The sea is charted by something that cannot hold it.'],
  ['mind', 'ice', 'The body slows. The thinking does not.'],
  ['mind', 'order', 'Order keeps the rules. Mind wrote them.'],
  ['void', 'water', 'The sea pours into nothing and is simply gone.'],
  ['void', 'lightning', 'No spark without something willing to burn.'],
  ['void', 'chaos', 'Even disorder needs somewhere to happen.'],
  ['water', 'chaos', 'A flood is only chaos that found a direction.'],
  ['water', 'spirit', 'Even the soul takes the shape of what carries it.'],
  ['life', 'chaos', 'Life is what disorder becomes when it settles.'],
  ['life', 'order', 'Every rule of growth was written by growing.'],
  ['ice', 'time', 'Frozen, the hour stops arriving.'],
  ['ice', 'mist', 'Fog holds still long enough and turns to frost.'],
  ['mist', 'life', 'By morning the forest has lost its edges.'],
  ['mist', 'mask', 'Why wear a face where none can be seen.'],
  ['dream', 'water', 'Both take any shape. Only one does it while you sleep.'],
  ['dream', 'chaos', 'Disorder with a story is still a story.'],
  ['death', 'water', 'The river carries them. It does not bring them back.'],
  ['death', 'fire', 'Every fire is a thing already on its way out.'],
  ['chaos', 'lightning', 'Power without aim is only weather.'],
  ['stone', 'light', 'The light lands, and the rock is unchanged.'],
  ['spirit', 'light', 'Being seen is not the same as being known.']
];

/** [either, either, line], the pair stalemates */
const STALEMATES: Pair[] = [
  ['void', 'ice', 'Absolute cold mirrors the void.'],
  ['light', 'fire', 'Two radiances, neither dimming.'],
  ['light', 'time', 'Light moves in time, and is timeless too.'],
  ['light', 'order', 'Truth is the highest order.'],
  ['fire', 'lightning', 'One strikes. One spreads.'],
  ['life', 'spirit', 'Two sides of living. One seen, one unseen.'],
  ['mind', 'spirit', 'Thought questions. Spirit knows.'],
  ['stone', 'order', 'The wall and the law hold the same way.'],
  ['stone', 'balance', 'Both hold, and do not move.'],
  ['mist', 'void', 'Both are the shape of absence.'],
  ['mist', 'water', 'A cloud is only water that forgot to fall.'],
  ['mist', 'dream', 'Both are true only while you are inside them.'],
  ['balance', 'light', 'Both are ways of saying what is true.'],
  ['balance', 'water', 'Water always finds its level.'],
  ['balance', 'life', 'Everything alive is balancing.'],
  ['dream', 'life', 'Everything that lives, dreams.'],
  ['death', 'void', 'One is the end. One never began.'],
  ['death', 'life', 'Neither exists without the other.'],
  ['death', 'time', 'They have always walked together.'],
  ['death', 'dream', 'Sleep and its older brother.'],
  ['mask', 'water', 'Both become whatever holds them.'],
  ['mind', 'death', 'The thought ends. The thinking does not.'],
  ['spirit', 'mist', 'Both move without being touched.'],
  ['spirit', 'dream', 'The soul and the dream share a bed.'],
  ['ice', 'dream', 'The frozen night dreams anyway.'],
  ['lightning', 'mask', 'Both are gone before you look twice.']
];

export type Outcome = 'win' | 'lose' | 'tie';

export interface Matchup {
  /** null = stalemate */
  winner: ElementId | null;
  line: string;
}

const key = (a: ElementId, b: ElementId) => `${a}|${b}`;

const MATCHUPS = new Map<string, Matchup>();
for (const [winner, loser, line] of VICTORIES) {
  MATCHUPS.set(key(winner, loser), { winner, line });
  MATCHUPS.set(key(loser, winner), { winner, line });
}
for (const [a, b, line] of STALEMATES) {
  MATCHUPS.set(key(a, b), { winner: null, line });
  MATCHUPS.set(key(b, a), { winner: null, line });
}

export interface RoundResult {
  player: ElementId;
  opponent: ElementId;
  outcome: Outcome;
  line: string;
}

export function resolve(player: ElementId, opponent: ElementId): RoundResult {
  if (player === opponent) {
    return { player, opponent, outcome: 'tie', line: 'Facing yourself, nothing moves.' };
  }
  if (player === DRAGON || opponent === DRAGON) {
    return {
      player,
      opponent,
      outcome: player === DRAGON ? 'win' : 'lose',
      line: 'Older than the argument. It ends it.'
    };
  }
  const m = MATCHUPS.get(key(player, opponent));
  if (!m) {
    // Unreachable if the assert below passes; kept so a gap degrades to a
    // stalemate rather than throwing mid-match.
    return { player, opponent, outcome: 'tie', line: 'The codex is silent here.' };
  }
  return {
    player,
    opponent,
    outcome: m.winner === null ? 'tie' : m.winner === player ? 'win' : 'lose',
    line: m.line
  };
}

/** Beats / loses-to lists for the Codex index, derived from the same table. */
export function relations(element: ElementId) {
  const beats: ElementId[] = [];
  const losesTo: ElementId[] = [];
  const holds: ElementId[] = [];
  for (const other of CORE_ELEMENTS) {
    if (other === element) continue;
    const m = MATCHUPS.get(key(element, other));
    if (!m) continue;
    if (m.winner === null) holds.push(other);
    else if (m.winner === element) beats.push(other);
    else losesTo.push(other);
  }
  return { beats, losesTo, holds };
}

// Completeness + symmetry assert. Runs only in dev; a gap or a contradiction
// is a data bug that should never reach a player.
if (import.meta.env.DEV) {
  const missing: string[] = [];
  for (let i = 0; i < CORE_ELEMENTS.length; i++) {
    for (let j = i + 1; j < CORE_ELEMENTS.length; j++) {
      const a = CORE_ELEMENTS[i];
      const b = CORE_ELEMENTS[j];
      if (!MATCHUPS.has(key(a, b))) missing.push(`${a} vs ${b}`);
    }
  }
  if (missing.length) {
    console.error(`[codex] ${missing.length} unauthored matchup(s)`, missing);
  }
}

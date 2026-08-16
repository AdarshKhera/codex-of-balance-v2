# The Ascent: a 10-level progression, and how to score it

Status: **plan only, no code changes yet.** For review. Nothing here is built.

## What this is

Right now the game is one flat mode: all 18 elements, one match, done. The ask
is to turn it into a real progression, gamified, with a spiritual/alchemical
frame ("you're beating your own conscience, connecting to something larger,
passing through trials"), where the pool of elements grows as you climb, each
level looks a little different, and there's a leaderboard that means something.

Below is a full design: what each level is, why those specific elements belong
together, how a level is cleared, what the leaderboard actually measures, and
one structural change I'm recommending along the way that also fixes an open
problem noted in the v2 README. It also covers a second request that came in
after the first pass: a **Free Play** mode alongside the Ascent, so the game
isn't only a one-way climb.

## Two modes, chosen up front

Title screen's Play button stops going straight to naming and instead opens a
short choice, two options, same visual language as everything else (no new
component system, just two `action`-style cards):

- **Story** — the Ascent. Ten chapters, elements unlock as you climb, best of
  10 per chapter, exactly as designed below.
- **Free Play** — everything unlocked immediately, no progression, no gate.
  Best of **20**, first to **11**. The long-form, no-stakes version for
  someone who already knows the Codex and just wants a longer match, or wants
  to try elements they haven't unlocked in Story yet.

  (Naming this "Free Play" rather than "Free to Play" on purpose — the
  latter is a loaded term in gaming that usually signals monetization, which
  has nothing to do with what this mode actually is.)

Free Play is deliberately the *only* place round count changes — Story stays
fixed at best of 10 across every chapter (see "Explicitly not doing" below,
that constraint is still the reason the Ascent leaderboard is trustworthy).
Free Play has no leaderboard implications at all: matches played there don't
touch `highestChapter` or `lifetimeWins`. It's play for its own sake. This
also closes off an obvious exploit before it exists — without that wall,
grinding easy Free Play matches would inflate the win tiebreaker for free.

Free Play results still save to the existing Records screen (score, duration,
date) exactly as matches do today. It just never feeds the Ascent
leaderboard. Two separate lists for two separate things: Records is "things
I've played," the leaderboard is "how far I've climbed."

## The frame: "The Ascent"

Keep "The Codex of Balance" as the game's identity. The 10-level mode is
**The Ascent** — the book you've been reading (the Codex) turns out to have
chapters, and playing through them is climbing it. Each level is a numbered
chapter (Roman numerals, matching the book aesthetic already in the UI: I
through X), not a "world" or "stage," which would feel like a different,
more arcade-y game bolted onto this one.

The existing tagline stays true throughout: you are always playing your own
conscience. What changes level to level is how much of yourself you've met
yet.

## The nine chapters, plus the Dragon

Eighteen core elements, unlocked two at a time across nine chapters, always
as a **pair with a real relationship to each other** — not a random split.
The order moves through a recognizable arc: raw sensation, first perception,
the inner life, how you organize a world, the confrontation with mortality,
the uncertain and unconscious, and finally judgment. That arc is a fairly
standard shape for a "know thyself" story, which is exactly what this game's
writing has been doing since v2's copy already leans that way.

| # | Adds | Why this pair |
|---|------|----------------|
| I | Fire, Water | The first two things anything feels: heat and flow, urgency and yielding. Before there's a self there's sensation. |
| II | Life, Void | Presence and absence. Something and nothing. The self begins in the gap between having and lacking. |
| III | Light, Stone | What reveals, and what refuses to move. Insight and stubbornness — the first two tools you reach for. |
| IV | Ice, Lightning | Stillness and sudden force. Two opposite ways of responding when something happens to you. |
| V | Mind, Spirit | Thought and intuition — the first elements that live *inside* you rather than around you. |
| VI | Order, Chaos | How you organize the world, and how the world refuses to stay organized. |
| VII | Time, Death | What erodes, and what ends. The heaviest chapter on purpose — this is the one that's supposed to be a little uncomfortable. |
| VIII | Dream, Mist | What's felt but not provable. The unconscious, the half-seen. Not everything resolves. |
| IX | Balance, Mask | Judgment and persona. How you weigh what you've learned, and the face you show while doing it. Fittingly, the game's own namesake element is the last one you earn. |
| X | — | No new element. This is where the Dragon appears. See below. |

That's 2 elements × 9 chapters = 18, matching `CORE_ELEMENTS` exactly. Chapter
X is deliberately not "+2 more" — it's a different kind of level.

### Chapter X: the Dragon, held back until here

Recommendation, not just a formatting choice: **the Dragon should not appear
in Chapters I through IX at all.** It only enters the hand starting at
Chapter X.

Why: right now the Dragon can show up in round one of any match, and the v2
README already flags it as "strictly dominant" — when it's on the table,
taking it is always correct, so that round has no real decision in it. That's
a genuine design flaw sitting unresolved.

Holding it back solves both problems at once:

- Chapters I–IX become **pure knowledge-and-choice** — every round in them has
  a real decision, because nothing in the hand auto-wins. That's nine levels
  where getting better literally means learning the Codex better.
- Chapter X becomes the one level where the old rule (never lost to anything
  but itself) is finally true, and it's true *because* the game has spent
  nine chapters building up "every choice matters" so this one big exception
  actually lands as an exception. It reads as intentional instead of as a
  balance bug.

Chapter X's copy can say this outright: something like *"Nine chapters, and
every choice was yours to weigh. This one isn't. The Dragon doesn't ask to be
included."* That turns the mechanical quirk into the point of the finale.

## Clearing a level

- A level's match is the same shape as today: best of 10, first to 6. No
  special rules per level — the escalation is entirely in how many elements
  are in play and how much you have to know, not in changing the win
  condition, which would make the leaderboard harder to trust (see below).
- **Win the match → the next chapter unlocks.** Lose, or leave mid-match →
  nothing changes, you just try that chapter again. No lives, no penalty,
  no reset of earlier progress. This keeps the loop low-stress, matches the
  calm tone of the rest of the app, and — importantly for the scoring
  section below — means there's no way to *lose* your way into a better
  leaderboard position, only win your way there.
- Progress (highest chapter unlocked) is saved locally, same mechanism as
  records today. A player can always replay an earlier chapter for fun; doing
  so doesn't affect their saved progress either way.

## The level-clear moment

This is the "at the end of each level, the user sees these elements have been
added" beat. Concretely, a new screen between Verdict and the next chapter's
Naming/Match:

1. Roman numeral of the chapter just cleared, large, in the display serif.
2. The one-line "why this pair" text from the table above.
3. The two new sigils bloom in, one at a time, each with its existing
   `ELEMENT_NOTE` line underneath (already written for all 18 — no new copy
   needed here beyond the per-chapter pairing lines).
4. A single action: continue to the next chapter.

This reuses `Sigil`, the `rise`/`bloom` animation vocabulary, and
`ELEMENT_NOTE` that already exist. No new content system required, just a new
screen that arranges existing pieces.

## Backgrounds: one accent per chapter

The existing `.atmosphere`/`.game-background` layers already support this —
they're two soft radial gradients plus grain, driven by CSS custom
properties. Instead of inventing ten new background systems, each chapter
sets one CSS variable, `--chapter-accent`, that the existing atmosphere
layers tint toward. Cheap, consistent, and it means the visual language
never breaks from the rest of the app — it's the same ink-and-bone surface,
just breathing a different color.

Colors chosen to trace an emotional arc, not just to look nice in sequence:
starts cool and small, moves through the deliberately heaviest, most muted
point at Time/Death, opens back up through the dreamlike haze of
Dream/Mist, and resolves into gold at Balance/Mask — which is also the
game's one existing accent color, so the palette literally converges on
itself by the end. Chapter X goes full gilt, matching the Dragon's existing
`dragon-breath` glow.

| Chapter | Accent mood |
|---|---|
| I | Warm ember + cool teal, faint |
| II | Deep green + true black |
| III | Pale gold + slate |
| IV | Icy blue + electric amber |
| V | Violet + warm bone |
| VI | Structured vs. drifting (subtle pattern shift, not just color) |
| VII | Sepia, low-saturation — the somber one |
| VIII | Lavender haze, softest and blurriest |
| IX | Gold + deep red, converging on the existing gilt accent |
| X | Full gilt, dragon glow dominant |

## Scoring and the leaderboard

You flagged the trap correctly: time-to-clear would reward rushing a game
that has no skill expression in speed at all (both picks are blind and
simultaneous — reacting faster to nothing doesn't mean anything), and pure
score-margin (what the current Records screen sorts by) is noisier than it
looks, because a lot of a single round's outcome is genuinely down to what
you and the Codex happened to be holding, not a decision either side made.

**Recommendation: the leaderboard is ranked by highest chapter reached, with
lifetime match wins as the tiebreaker.** Nothing else.

Why this holds up against "simple, honest, tangible, not random":

- **Simple.** "Chapter VII of X, 14 wins" is legible instantly. No formula,
  no weighting, nothing to explain.
- **Honest.** The only way a chapter advances is a genuine win. There's no
  bonus for finishing fast, no penalty for taking a break mid-thought, no
  way to inflate it by replaying easy chapters (since progress only tracks
  the *highest* chapter, not a cumulative score you can farm).
- **Tangible.** A chapter number means something on its own — everyone
  looking at "IX" knows that's someone who's met almost every element.
  Compare that to "1,840 points," which means nothing without a scale.
- **Filters out the luck this game genuinely has.** A single round can go
  against you for reasons you couldn't have acted on. A *level*, cleared
  over up to 10 rounds with the win threshold at 6, averages that noise out.
  Over enough rounds, the player who knows the Codex and reads the hand well
  wins more often than not — which is exactly what v2's own simulation
  already showed (roughly 65% for a player who takes the Dragon on sight
  under the current single-mode rules). Level depth rewards that real skill
  differential instead of a single lucky or unlucky margin.

One integrity note worth being explicit about: the Match screen already lets
a player leave mid-match with no consequence (`onQuit`). Under this design
that's fine *by construction* — quitting never advances your chapter, so
there's nothing to gain by bailing on a match that's going badly. No new
anti-cheat logic needed; the "only real wins count" rule already closes that
door on its own.

The existing Records screen's per-entry data (score, duration, date) can stay
as flavor text under each leaderboard row — "Chapter VII · 3–6 · 0:41" reads
fine — it just stops being what the list is *sorted by*.

## Data shape (sketch, not final)

```ts
interface AscentProgress {
  highestChapter: number;      // 1-10, persisted, monotonic
  lifetimeWins: number;
}

interface LeaderboardEntry {
  name: string;
  highestChapter: number;
  lifetimeWins: number;
  lastPlayed: string;
}
```

Both live in `localStorage` next to the existing records key, same pattern
as today — no backend, no accounts, matches how the rest of the app already
persists state.

## Explicitly not doing (scope guard for this plan)

- **No adaptive/rubber-band AI.** The opponent's element choice stays exactly
  as random as it is today at every chapter. Difficulty comes from pool size
  and what the player has learned, not from the game quietly getting harder
  behind the scenes — that would undercut "honest."
- **No per-chapter rule changes within Story** (round count, win target) — one
  consistent rule set across all ten chapters keeps the leaderboard
  comparable across players. Free Play is the one deliberate exception
  (best of 20), and it's exempt from the leaderboard specifically because it
  isn't held to that consistency.
- **No online/global leaderboard.** Same local-only model as Records today.
  Going global would need accounts and a backend, a much bigger change.
- **No chapter skipping / level select for a first pass.** Replay of earlier
  chapters is fine and free, but chapters unlock strictly in order. A level
  select screen is a reasonable later addition, not part of this plan.

## Open questions for you

1. Does the Chapter I-IX pairing order and the "why" read right, or would you
   reorder any pair? (Chapter VII, Time/Death, is deliberately the emotional
   low point — happy to move it if that's too heavy for the middle of the
   game rather than near the end.)
2. Confirm holding the Dragon back until Chapter X — this is the one change
   here that alters current behavior (Dragon can appear from round one
   today), not just an addition.
3. Comfortable with chapter depth being the *only* leaderboard axis, with
   wins as a tiebreaker, and dropping margin as the sort key entirely?
4. Free Play at first to 11 of 20 — that's the same win ratio as Story's
   first to 6 of 10 (roughly 55-60%, majority-decides in both), just a longer
   match. Want a different target, or should Free Play require a full sweep
   of all 20 rounds instead of ending early once someone's unreachable?

# Mechanics v3: from coin flip to strategy

Status: **plan only, nothing built.** For review.

## The actual problem

Both sides currently pick blind and simultaneously. That has two failures at once:

1. **No decision exists.** If you can't see their pick, your pick can't be
   "right" or "wrong". Nothing you know about the Codex helps you in the
   moment. Reading the book has zero effect on play.
2. **It's still degenerate.** Against a random opponent there is one best
   move: the element with the best win/loss record in the table (Time, 9-5).
   Always playing it is optimal. So the game is both random *and* solved.

Everything below fixes this with one structural change and three small rules
stacked on top.

## The change: they play first, you answer

The opponent reveals their element. Then you choose yours, knowing theirs.

That's it. Now every round is a question with a correct answer, and knowing
the table is the entire skill. It also fits the story better than before: your
conscience confronts you with something, and you have to meet it correctly.

This alone removes all luck from your decisions. The only randomness left is
*which* question you're asked, which is exactly the right place for it, the
same way a flashcard deck shuffles.

## Three rules that make it strategy, not just recall

If the only rule were "counter what they played", it'd be a quiz. These make it
a game. All three are one sentence each.

### 1. Each element is single use

Spend an element and it's gone for the rest of the level. This is the whole
skill ceiling and it's why the game becomes strategic rather than reflexive:
Water beats Fire, but Water is also your only answer to two other things
coming later. Do you spend it now or eat a loss and save it?

### 2. You can see their next two moves

Current move, plus the next two queued. You're no longer reacting, you're
planning: "Fire now, then Stone, then Time. I have one Water left. Where does
it do the most good?"

Partial information, so it's a plan under uncertainty rather than a solved
puzzle. Early levels show most of the queue simply because they're short.

### 3. The Dragon is a single charge you spend

From level 5 on, the Dragon sits in your hand as a one-per-level trump. It
beats anything. Using it is a real decision: burn it early on a round you'd
lose anyway, or hold it in case something worse comes when your hand is empty?

This finally fixes the Dragon. It stops being a free win handed to whoever
happens to see it, and becomes a resource with a genuine "when" attached. It's
also exactly what you described: something you *expend*.

## Scoring

| Outcome | Points |
|---|---|
| Your element beats theirs | **+3** |
| The pair ties | **+1** |
| Theirs beats yours | **0** |

Deliberately not a "first to 6" race. Every round is worth playing, you can
see how well you did rather than just whether you scraped a win, and it makes
a leaderboard number that actually means something.

**Lives:** 3 per level. Only a loss costs one, a tie doesn't. Run out and the
level is failed, retry it. Points decide how *well* you did; lives decide
whether you finish. Two separate, standard, easily understood things.

**Stars,** based on the percentage of the level's maximum:

- 3 stars: 90%+
- 2 stars: 70%+
- 1 star: 50%+ (level cleared, next one unlocks)
- Under 50%: retry

## Hand size and round count per level

Always at least two spare elements, so there's a real choice to the very last
round rather than a forced move. Knowledge load rises as slack rises, which
keeps the difficulty curve honest.

| Level | Pool | Rounds | Spare | Pairs to know | Max score |
|---|---|---|---|---|---|
| I Instinct | 4 | 3 | 1 | 6 | 9 |
| II Perception | 6 | 4 | 2 | 15 | 12 |
| III Reaction | 8 | 6 | 2 | 28 | 18 |
| IV Inwardness | 10 | 8 | 2 | 45 | 24 |
| V Design | 12 | 10 | 2 | 66 | 30 |
| VI Reckoning | 14 | 10 | 4 | 91 | 30 |
| VII The Unseen | 16 | 10 | 6 | 120 | 30 |
| VIII Judgment | 18 | 10 | 8 | 153 | 30 |
| IX Communion | 18 | 10 | 8 | 153 | 30 |
| X The Undeniable | 18 + Dragon | 10 | 8 | 153 | 30 |

Level I is a tiny four-element ordering puzzle with six relationships to know.
That's the right size for a first level, and it teaches the core idea (spend
your counters in the right order) in about a minute.

## The study screen, before each level

This was the best idea in your message and it deserves to be prominent.

Before a level starts, a screen shows **only the new relationships** that level
introduces, not the whole table. At level II (adding Light and Stone) that's
Light and Stone against the four you already know, plus each other. Nine facts.
Digestible in fifteen seconds.

It's the same content as the Codex, sliced to just what's new, at the moment
it's about to matter. The Codex stays available mid-round for anyone who wants
to look something up: this is a game about learning a table, so looking is
fine. People stop looking on their own once they've learned it, because looking
is slower.

## Leaderboard

**Sum of your best score on each level.** Tiebreak on total stars.

- Honest: only real play moves it.
- Tangible: "184 of 243" tells you exactly where you are.
- It makes replaying earlier levels meaningful, which fixes a real dead spot
  in the current build where replaying a cleared chapter does nothing at all.
- It rewards the skill the game now actually has, since scores come from
  correct answers rather than favourable dice.

## What this replaces

- Best of 10 / first to 6: gone, replaced by fixed rounds and a point total.
- Simultaneous blind picks: gone, they reveal first.
- Dragon as a random spawn in the hand: gone, it's a spendable charge.
- Match margin as a record: replaced by score and stars.

Kept exactly as is: the 153-pair table and every line of writing in it, the
sigils, the chapter names and order, the level map with locks, Free Play, and
the whole visual system.

## Free Play under the new rules

Same mechanics, 15 rounds, full 18 element pool, no lives, no level gating.
A score attack mode: one number at the end, nothing to fail. Still excluded
from the Story leaderboard for the same reason as before.

## Open questions

1. **Lives at 3** feels right to me for a game where a wrong answer is a
   knowledge gap rather than a reflex miss, but it's the number most likely to
   need tuning after you play it. Easy to change.
2. **Dragon from level V** is a guess at pacing. Earlier makes levels I-IV
   safer, later makes it feel more like a finale.
3. **Should a tie cost nothing at all?** Right now it's +1 and no life. That
   makes deliberately steering into a tie a legitimate defensive play when you
   have no winning answer left, which I think is good, but it does mean some
   rounds you'll aim to draw.

## Separate small task, agreed already

Rename the game from The Codex of Balance to **The Scale**. Title screen,
`index.html` title and meta, README, and any in-copy reference. The book icon
and the Codex screen keep their name, since a codex inside a game called The
Scale still reads fine, and "what beats what" stays the heading.

# The Codex of Balance

A quiet game of elements. Each round you pick one of eighteen, your opponent picks
one blind, and the pairing decides itself. Win 6 rounds out of 10 and the match is
yours.

This is a ground up rebuild of v1. The rules and the writing carried over. The
design did not.

```bash
npm install
npm run dev
```

## What changed from v1, and why

**Emoji became drawn sigils.** This was the single loudest amateur signal in v1.
Emoji render differently on every platform, arrive with their own inconsistent
colour and optical weight, and read as placeholder art. All nineteen marks are now
drawn on the same 32 unit grid at one stroke weight, inheriting `currentColor`.
See `src/ui/Sigil.tsx`.

**A token system instead of utility classes.** Every colour, size, space and easing
curve resolves to a custom property in `src/styles/tokens.css`. v1's spacing looked
arbitrary because it was: sizes were picked per component from whatever Tailwind
step looked close. Nothing in a component file here invents its own number.

**Ink and bone, not black on white.** Pure white behind pure black vibrates. The
palette is a warm near black with a bone foreground, one gilt accent reserved for
the player and for the single most important action on any screen, and eighteen
heavily desaturated element hues that only ever tint a sigil.

**A display serif for the writing.** The poetic line is the entire point of the
game, so it is set in Instrument Serif at the largest size on the screen, larger
than the score. UI text stays in Inter.

**The reveal is staged in beats.** Your choice, then their answer, then the line,
then the verdict. Four moments rather than one dump of state. `BEATS` in
`src/ui/screens/Match.tsx`.

**The engine is pure.** `src/game/engine.ts` holds the rules as data and the match
as a set of pure transitions. v1 resolved rounds inside a component with nested
`setTimeout` calls closing over stale state, which is how it managed to declare you
the loser after you had reached 6 wins.

## The matchup table

`src/game/elements.ts`. Every pairing is authored **once**, as an unordered pair,
and both directions are derived from it. That makes a self contradicting entry
impossible to write, and a missing pair is caught by a dev only assert on load.
All 153 pairings are filled and symmetric.

## Balance

Two problems showed up under simulation and were fixed.

**Too many draws.** 48 of the 153 pairings stalemated, so about a third of every
match resolved to nothing. 22 of those are now decisive, with each win going to
whichever element was short of them. Down to 26 stalemates.

**The Dragon was a free win.** It appeared in 30% of rounds and the opponent
contested it only 15% of the time, so simply taking it whenever it appeared won
about 77% of matches. It now appears slightly less often and is contested far more
(`RULES` in `engine.ts`). A player who takes it on sight now wins about 66%.

Both numbers came from simulating thousands of matches against the real engine
rather than from taste.

### Still open

The Dragon remains strictly dominant: when it is on the table, taking it is always
correct, so that round contains no decision. Tuning its rate moves the win rate but
does not give the round its choice back. The real fix is to give it a single
counter, or to make it a once per match resource so the decision becomes *when* to
spend it. Both change the rules, so both are left alone here.

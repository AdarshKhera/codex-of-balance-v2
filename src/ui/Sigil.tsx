import type { ElementId } from '../game/elements';

/* ============================================================
   Sigils.

   Emoji were the single loudest amateur signal in v1: they render
   differently on every platform, carry their own inconsistent colour and
   weight, and read as placeholder art. These are drawn instead, one
   geometric mark per element, all on a 32x32 grid, all at the same stroke
   weight, all inheriting currentColor. That consistency is what makes a
   set of icons look designed rather than assembled.
   ============================================================ */

const S = 1.25; // one stroke weight for the entire set

/** Archimedean spiral, 2.25 turns, centred in the 32 box. */
function spiral() {
  const pts: string[] = [];
  const turns = 2.25;
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = 1.6 + (t / (turns * Math.PI * 2)) * 10.8;
    pts.push(`${(16 + Math.cos(t) * r).toFixed(2)} ${(16 + Math.sin(t) * r).toFixed(2)}`);
  }
  return `M${pts.join('L')}`;
}

const PATHS: Record<ElementId, JSX.Element> = {
  // An empty ring, the absence everything else is measured against.
  void: <circle cx="16" cy="16" r="9" />,

  // Disc with rays.
  light: (
    <>
      <circle cx="16" cy="16" r="5.5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={16 + Math.cos(a) * 9}
            y1={16 + Math.sin(a) * 9}
            x2={16 + Math.cos(a) * 12.5}
            y2={16 + Math.sin(a) * 12.5}
          />
        );
      })}
    </>
  ),

  // Two travelling waves.
  water: (
    <>
      <path d="M4 13.5c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
      <path d="M4 19.5c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3" />
    </>
  ),

  // A flame: one asymmetric leaf, with an inner core.
  fire: (
    <>
      <path d="M16 4c4.5 5.2 8 8.6 8 13a8 8 0 0 1-16 0c0-3 1.4-5 3.2-7 .5 1.7 1.6 2.7 2.8 3 .4-3.4-.6-6.2-1.2-7.6C14 6.4 15 5 16 4Z" />
      <path d="M16 25a4 4 0 0 1-4-4c0-2 1.6-3.4 4-6 2.4 2.6 4 4 4 6a4 4 0 0 1-4 4Z" />
    </>
  ),

  // A sprout, stem and two leaves.
  life: (
    <>
      <path d="M16 27V11" />
      <path d="M16 15c0-4 2.6-6.6 7-7 .4 4.4-2.2 7-7 7Z" />
      <path d="M16 19c0-3.4-2.2-5.6-6-6-.4 3.8 1.8 6 6 6Z" />
    </>
  ),

  // Bolt.
  lightning: <path d="M18 3 9 18h5.5L13 29l10-16h-6l1-10Z" />,

  // Six-fold crystal.
  ice: (
    <>
      {Array.from({ length: 3 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return (
          <line
            key={i}
            x1={16 - Math.cos(a) * 12}
            y1={16 - Math.sin(a) * 12}
            x2={16 + Math.cos(a) * 12}
            y2={16 + Math.sin(a) * 12}
          />
        );
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        const bx = 16 + Math.cos(a) * 7.5;
        const by = 16 + Math.sin(a) * 7.5;
        return (
          <g key={i}>
            <line x1={bx} y1={by} x2={bx + Math.cos(a + 0.9) * 4} y2={by + Math.sin(a + 0.9) * 4} />
            <line x1={bx} y1={by} x2={bx + Math.cos(a - 0.9) * 4} y2={by + Math.sin(a - 0.9) * 4} />
          </g>
        );
      })}
    </>
  ),

  // Nested arcs, a map of a thought, folding in on itself.
  mind: (
    <>
      <path d="M16 27c-6 0-10-4.2-10-9.6C6 10.6 10.4 5 16 5s10 5.6 10 12.4C26 22.8 22 27 16 27Z" />
      <path d="M16 22c-2.6 0-4.4-1.8-4.4-4.4 0-3 1.8-5.6 4.4-5.6s4.4 2.6 4.4 5.6c0 2.6-1.8 4.4-4.4 4.4Z" />
    </>
  ),

  // Spiral. Generated rather than hand-authored so it is guaranteed to stay
  // inside the 32 box and to keep an even winding.
  chaos: <path d={spiral()} />,

  // Feather.
  spirit: (
    <>
      <path d="M9 27 24 8" />
      <path d="M24 8c-6.5-2.5-12 1.5-13.6 8.4C9.2 22 10 25.5 11.5 27c3.4-1 7-2.6 9.4-6 2.6-3.6 3.6-8.4 3.1-13Z" />
    </>
  ),

  // Hourglass.
  time: (
    <>
      <path d="M9 4h14M9 28h14" />
      <path d="M10.5 4c0 6 5.5 8.6 5.5 12s-5.5 6-5.5 12" />
      <path d="M21.5 4c0 6-5.5 8.6-5.5 12s5.5 6 5.5 12" />
    </>
  ),

  // Lattice, structure, repeated and dependable.
  order: (
    <>
      <rect x="5" y="5" width="22" height="22" rx="2" />
      <path d="M5 12.3h22M5 19.7h22M12.3 5v22M19.7 5v22" />
    </>
  ),

  // Faceted block.
  stone: (
    <>
      <path d="m16 4 10 6.5v11L16 28 6 21.5v-11L16 4Z" />
      <path d="M6 10.5 16 17l10-6.5M16 17v11" />
    </>
  ),

  // Three drifting bands, deliberately not aligned.
  mist: (
    <>
      <path d="M5 11h16" />
      <path d="M9 16h18" />
      <path d="M5 21h13" />
      <path d="M22 21h5" />
      <path d="M24 11h3" />
    </>
  ),

  // Scales.
  balance: (
    <>
      <path d="M16 5v22M9 27h14" />
      <path d="M5 10h22" />
      <path d="M5 10 1.5 18a4.5 4.5 0 0 0 7 0L5 10Z" />
      <path d="M27 10l-3.5 8a4.5 4.5 0 0 0 7 0L27 10Z" />
    </>
  ),

  // Crescent and a star.
  dream: (
    <>
      <path d="M21 5a11 11 0 1 0 6 9.5A8.5 8.5 0 0 1 21 5Z" />
      <path d="M24.5 20.5 25.5 23l2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </>
  ),

  // A setting sun below the horizon, an ending, not a skull.
  death: (
    <>
      <path d="M4 22h24" />
      <path d="M8 22a8 8 0 0 1 16 0" />
      <path d="M6 27h20" />
    </>
  ),

  // Theatre mask, an outline with two absences where the eyes go.
  mask: (
    <>
      <path d="M16 5c6 0 9 2 9 8 0 8-4.5 14-9 14S7 21 7 13c0-6 3-8 9-8Z" />
      <path d="M11.5 13.5c1.4-1 2.8-1 4 0" />
      <path d="M16.5 13.5c1.2-1 2.6-1 4 0" />
    </>
  ),

  // Ouroboros, the serpent closing the circle.
  dragon: (
    <>
      <path d="M16 5.5a10.5 10.5 0 1 1-9.4 5.8" />
      <path d="M6.6 11.3 4 7.6M6.6 11.3l-4.2.9" />
      <circle cx="16" cy="9.4" r="1.15" fill="currentColor" stroke="none" />
    </>
  )
};

interface SigilProps {
  element: ElementId;
  size?: number;
  className?: string;
}

export function Sigil({ element, size = 32, className }: SigilProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={S}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[element]}
    </svg>
  );
}

/* Chrome icons. Same 32 grid and stroke weight as the sigils, a set of icons
   only looks designed when the optical weight matches across all of them. */

interface IconProps {
  size?: number;
}

function Icon({ size = 22, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const BackIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 6 9 16l10 10" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 8l16 16M24 8 8 24" />
  </Icon>
);

export const CodexIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6h8a4 4 0 0 1 4 4v16a3 3 0 0 0-3-3H6V6Z" />
    <path d="M26 6h-8a4 4 0 0 0-4 4v16a3 3 0 0 1 3-3h9V6Z" />
  </Icon>
);

export const RecordsIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11 5h10v7a5 5 0 0 1-10 0V5Z" />
    <path d="M11 7H7v2a4 4 0 0 0 4 4M21 7h4v2a4 4 0 0 1-4 4" />
    <path d="M16 17v5M12 27h8l-1-5h-6l-1 5Z" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 8.5v15l13-7.5-13-7.5Z" />
  </Icon>
);

export const ForwardIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13 6l10 10-10 10" />
  </Icon>
);

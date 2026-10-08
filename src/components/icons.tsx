import type {IconId} from '../core/ids';

// original line icons on a 24x24 grid, stroke only
// functions, not elements: JSX must not run at module load (Remotion provides React later)
export const ICONS: Record<IconId, () => React.ReactNode> = {
  heart: () => <path d="M12 20.5C6 16.6 3 13.4 3 9.6 3 7 5 5 7.4 5c1.7 0 3.4.9 4.6 2.7C13.2 5.9 14.9 5 16.6 5 19 5 21 7 21 9.6c0 3.8-3 7-9 10.9z" />,
  calendar: () => (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14.5" r=".7" />
      <circle cx="12" cy="14.5" r=".7" />
      <circle cx="15.5" cy="14.5" r=".7" />
    </>
  ),
  map: () => (
    <>
      <path d="M12 21c4.2-4.5 6.3-7.7 6.3-10.6A6.3 6.3 0 0 0 5.7 10.4C5.7 13.3 7.8 16.5 12 21z" />
      <circle cx="12" cy="10.4" r="2.3" />
    </>
  ),
  cards: () => (
    <>
      <rect x="4" y="5" width="10" height="14" rx="2.2" transform="rotate(-9 9 12)" />
      <rect x="10" y="5.5" width="10" height="14" rx="2.2" transform="rotate(9 15 12.500)" />
    </>
  ),
  sparkles: () => <path d="M12 3l2.1 6 5.9 2.1-5.9 2.1L12 19.2l-2.1-6L4 11.1 9.9 9zM19 3.5v3M17.5 5h3" />,
  check: () => <path d="M4.5 12.5l5 5 10-11" />,
  list: () => (
    <>
      <path d="M9 6.5h11M9 12h11M9 17.5h11" />
      <circle cx="4.8" cy="6.5" r=".9" />
      <circle cx="4.8" cy="12" r=".9" />
      <circle cx="4.8" cy="17.5" r=".9" />
    </>
  ),
  star: () => <path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17.3l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />,
  bell: () => <path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21.5a2.2 2.2 0 0 0 4 0" />,
  chat: () => <path d="M4 5.5h16v11H9.5L4.5 20.5v-4H4z" />,
  home: () => <path d="M4 11l8-7 8 7v9.5H4zM10 20.5v-6h4v6" />,
  users: () => (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
      <circle cx="17.2" cy="9.5" r="2.4" />
      <path d="M16.2 14.3c2.9.3 4.8 2.5 4.8 5.7" />
    </>
  ),
  lock: () => (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
};

export const Icon: React.FC<{id: IconId; size: number; color: string; stroke?: number}> = ({id, size, color, stroke = 1.700}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {ICONS[id]()}
  </svg>
);

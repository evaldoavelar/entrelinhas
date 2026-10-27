import { useId } from 'react';

// Stroke icons drawn to match the prototype (24px grid, 1.5px stroke, round caps).
const PATHS = {
  headphones: 'M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H4zM17 15h3v5h-3z',
  home: 'M4 11 12 4l8 7v9h-5v-6h-6v6H4z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  rss: 'M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16 16l4 4',
  play: 'M8 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  prev: 'M15 6l-6 6 6 6',
  next: 'M6 5l9 7-9 7zM18 5v14',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  check: 'M5 12l5 5 9-10',
  close: 'M6 6l12 12M18 6 6 18',
  settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4',
  logout: 'M10 5H5v14h5M14 8l4 4-4 4M18 12H9',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, title, size = 20 }: { name: IconName; title?: string; size?: number }) {
  const id = useId();
  return (
    <svg
      className="el-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-labelledby={title ? id : undefined}
      focusable="false"
    >
      {title ? <title id={id}>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Read from disk: CSS imports (including ?raw) are not processed by Vitest.
const css = readFileSync(join(__dirname, 'tokens.css'), 'utf8');

// tokens.css is the single source of colour tokens. This test parses it and enforces WCAG
// contrast (CA27): 4.5:1 for text pairs, 3:1 for UI boundaries and focus indicators.

function themeVars(theme: 'dark' | 'light'): Record<string, string> {
  const block = new RegExp(`:root\\[data-theme='${theme}'\\]\\s*\\{([^}]*)\\}`).exec(css)?.[1];
  if (!block) throw new Error(`bloco do tema ${theme} ausente`);
  return Object.fromEntries([...block.matchAll(/(--color-[\w-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [m[1], m[2]]));
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = ['--color-bg', '--color-bg-sidebar', '--color-surface', '--color-surface-sunken'];
const TEXT_ON_ALL = ['--color-text', '--color-text-muted', '--color-success', '--color-warning', '--color-danger', '--color-info'];

const textPairs: [string, string][] = [
  ...TEXT_ON_ALL.flatMap((fg) => SURFACES.map((bg) => [fg, bg] as [string, string])),
  ['--color-accent-text', '--color-bg'],
  ['--color-accent-text', '--color-bg-sidebar'],
  ['--color-accent-text', '--color-surface-sunken'],
  ['--color-accent-text-on-surface', '--color-surface'],
  ['--color-on-primary', '--color-primary'],
];
const uiPairs: [string, string][] = [
  // Card/panel outline against the page it sits on (review 94dcddf): needed to identify panels,
  // especially in the light theme where card and page are both near white.
  ['--color-border', '--color-bg'],
  ['--color-input-border', '--color-surface'],
  ['--color-input-border', '--color-bg'],
  ['--color-focus', '--color-bg'],
  ['--color-focus', '--color-surface'],
  ['--color-primary', '--color-bg'],
  ['--color-primary', '--color-surface'],
];

describe.each(['dark', 'light'] as const)('%s theme', (theme) => {
  const vars = themeVars(theme);

  test.each(textPairs)('text %s on %s >= 4.5:1', (fg, bg) => {
    expect(vars[fg], fg).toBeDefined();
    expect(vars[bg], bg).toBeDefined();
    expect(contrast(vars[fg]!, vars[bg]!)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(uiPairs)('ui %s on %s >= 3:1', (fg, bg) => {
    expect(contrast(vars[fg]!, vars[bg]!)).toBeGreaterThanOrEqual(3);
  });
});

test('both themes define exactly the same tokens', () => {
  expect(Object.keys(themeVars('light')).sort()).toEqual(Object.keys(themeVars('dark')).sort());
});

test('dark theme keeps the Dracula palette sampled from the frames', () => {
  const dark = themeVars('dark');
  expect(dark).toMatchObject({
    '--color-bg': '#282a36',
    '--color-bg-sidebar': '#21222c',
    '--color-surface': '#44475a',
    '--color-surface-sunken': '#343746',
    '--color-primary': '#bd93f9',
    '--color-text': '#f8f8f2',
  });
});

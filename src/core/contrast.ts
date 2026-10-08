import type {Theme} from './schema';

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// WCAG contrast ratio, 1..21
export const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// text on both background stops needs 4.5:1, accent and ring on both stops 3:1
export function checkTheme(t: Theme): string[] {
  const out: string[] = [];
  for (const bg of t.bg) {
    const text = contrast(t.text, bg);
    if (text < 4.5) out.push(`text ${t.text} on ${bg}: ${text.toFixed(2)} < 4.5`);
    for (const [name, c] of [['accent', t.accent], ['ring', t.ring]] as const) {
      if (!c) continue;
      const r = contrast(c, bg);
      if (r < 3) out.push(`${name} ${c} on ${bg}: ${r.toFixed(2)} < 3`);
    }
  }
  return out;
}

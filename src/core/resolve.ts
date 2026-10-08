import type {Brand, Clip, Product, Scene, Text, Theme} from './schema';
import type {FormatId, SetId} from './ids';
import {FORMATS, type LayoutClass} from '../formats';

export const FPS = 30;

export const DEFAULT_SECONDS = {hook: 2.5, feature: 3.5, cta: 2.5} as const;

export type Content = {
  clipId: string; // "<product>/<name>"
  clip: Clip;
  brand: Brand;
  product: Product;
  themes: Record<string, Theme>;
};

export type ResolveOptions = {lang: string; format: FormatId; theme?: string};

export type ResolvedScene =
  | {type: 'hook'; text: string; frames: number}
  | {
      type: 'feature';
      title: string;
      subtitle?: string;
      media: {kind: 'image' | 'video'; src: string; from: number};
      highlight?: {x: number; y: number; size?: number};
      frames: number;
    }
  | {type: 'cta'; text: string; sub: string[]; frames: number};

export type ResolvedClip = {
  clipId: string;
  lang: string;
  format: FormatId;
  layout: LayoutClass;
  width: number;
  height: number;
  safe: {top: number; bottom: number};
  fps: number;
  setId: SetId;
  themeName: string;
  theme: Theme;
  brandName: string;
  logo?: string; // path relative to the content root
  scenes: ResolvedScene[];
  durationInFrames: number;
};

export class ResolveError extends Error {
  constructor(public problems: string[]) {
    super(problems.join('\n'));
    this.name = 'ResolveError';
  }
}

const join = (...parts: string[]) => parts.join('/').replace(/\/+/g, '/');

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function resolveClip(c: Content, opts: ResolveOptions): ResolvedClip {
  const problems: string[] = [];
  const where = c.clipId;
  const {lang} = opts;

  const langs = c.clip.langs ?? c.product.langs;
  if (!langs.includes(lang)) problems.push(`${where}: language "${lang}" is not enabled (available: ${langs.join(', ')})`);

  const text = (t: Text | undefined, field: string): string => {
    if (t === undefined) return '';
    if (typeof t === 'string') return t;
    const v = t[lang];
    if (v === undefined) {
      problems.push(`${where}: ${field} has no "${lang}" text`);
      return '';
    }
    return v;
  };

  const themeName = opts.theme ?? c.clip.theme ?? c.brand.defaultTheme;
  const theme = c.themes[themeName];
  if (!theme) problems.push(`${where}: theme "${themeName}" not found in brand "${c.clip.brand}" (available: ${c.brand.themes.join(', ')})`);

  const productDir = join('products', c.clip.product);
  const brandDir = join('brands', c.clip.brand);
  const fmt = FORMATS[opts.format];
  const seconds = (s: Scene) => s.seconds ?? DEFAULT_SECONDS[s.type];
  const frames = (s: Scene) => Math.round(seconds(s) * FPS);

  const scenes = c.clip.scenes.flatMap<ResolvedScene>((s, i) => {
    const f = `scenes[${i}]`;
    if (s.type === 'hook') {
      const t = text(s.text, `${f}.text`);
      const max = c.brand.voice?.maxHookWords;
      if (max && wordCount(t) > max) problems.push(`${where}: ${f}.text has ${wordCount(t)} words (brand maximum ${max})`);
      return [{type: 'hook', text: t, frames: frames(s)}];
    }
    if (s.type === 'feature') {
      const feat = c.product.features[s.feature];
      if (!feat) {
        problems.push(`${where}: ${f}.feature "${s.feature}" not found in product "${c.clip.product}"`);
        return [];
      }
      return [
        {
          type: 'feature',
          title: text(s.title ?? feat.title, `${f}.title`),
          subtitle: s.subtitle ?? feat.subtitle ? text(s.subtitle ?? feat.subtitle, `${f}.subtitle`) : undefined,
          media: feat.video
            ? {kind: 'video', src: join(productDir, feat.video), from: feat.from ?? 0}
            : {kind: 'image', src: join(productDir, feat.image ?? ''), from: 0},
          highlight: s.highlight ?? feat.highlight,
          frames: frames(s),
        },
      ];
    }
    const phase = s.phase ? c.brand.cta[s.phase] : undefined;
    if (s.phase && !phase) problems.push(`${where}: ${f}.phase "${s.phase}" not found in brand cta (available: ${Object.keys(c.brand.cta).join(', ')})`);
    const ctaText = s.text ?? phase?.text;
    if (ctaText === undefined) problems.push(`${where}: ${f} needs text or a phase`);
    const sub = (s.sub ?? phase?.sub ?? []).map((t, j) => text(t, `${f}.sub[${j}]`));
    return [{type: 'cta', text: text(ctaText, `${f}.text`), sub, frames: frames(s)}];
  });

  const banned = (c.brand.voice?.banned ?? []).map((w) => w.toLowerCase());
  for (const s of scenes) {
    const all = [s.type === 'cta' ? [s.text, ...s.sub] : s.type === 'hook' ? [s.text] : [s.title, s.subtitle ?? '']].flat().join(' ').toLowerCase();
    const hit = banned.find((w) => all.includes(w));
    if (hit) problems.push(`${where}: text contains banned word "${hit}"`);
  }

  if (problems.length || !theme) throw new ResolveError(problems);

  return {
    clipId: c.clipId,
    lang,
    format: opts.format,
    layout: fmt.layout,
    width: fmt.width,
    height: fmt.height,
    safe: fmt.safe,
    fps: FPS,
    setId: c.clip.set,
    themeName,
    theme,
    brandName: c.brand.name,
    logo: c.brand.logo ? join(brandDir, c.brand.logo) : undefined,
    scenes,
    durationInFrames: scenes.reduce((sum, s) => sum + s.frames, 0),
  };
}

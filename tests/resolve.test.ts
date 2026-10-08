import {describe, expect, it} from 'vitest';
import {BrandSchema, ClipSchema, ProductSchema, ThemeSchema} from '../src/core/schema';
import {ResolveError, resolveClip, type Content} from '../src/core/resolve';

const content = (over: Partial<Content> = {}): Content => ({
  clipId: 'p/c',
  clip: ClipSchema.parse({
    product: 'p',
    brand: 'b',
    formats: ['9x16'],
    scenes: [
      {type: 'hook', text: {en: 'Hello there', de: 'Hallo du'}},
      {type: 'feature', feature: 'one', seconds: 2},
      {type: 'cta', phase: 'launch'},
    ],
  }),
  brand: BrandSchema.parse({
    name: 'B',
    logo: 'assets/logo.svg',
    themes: ['dark', 'light'],
    defaultTheme: 'dark',
    voice: {maxHookWords: 4, banned: ['revolutionary']},
    cta: {launch: {text: {en: 'Get it', de: 'Hol es'}, sub: ['B']}},
  }),
  product: ProductSchema.parse({
    name: 'P',
    langs: ['en', 'de'],
    features: {one: {title: {en: 'One', de: 'Eins'}, image: 'screens/one.png', highlight: {x: 10, y: 20}}},
  }),
  themes: {
    dark: ThemeSchema.parse({bg: ['#000000', '#111111'], text: '#ffffff', accent: '#ff0000'}),
    light: ThemeSchema.parse({bg: ['#ffffff', '#eeeeee'], text: '#000000', accent: '#0000ff'}),
  },
  ...over,
});

describe('resolveClip', () => {
  it('resolves texts, assets and duration', () => {
    const r = resolveClip(content(), {lang: 'de', format: '9x16'});
    expect(r.width).toBe(1080);
    expect(r.height).toBe(1920);
    expect(r.themeName).toBe('dark');
    expect(r.logo).toBe('brands/b/assets/logo.svg');
    expect(r.scenes[0]).toMatchObject({type: 'hook', text: 'Hallo du', frames: 75});
    expect(r.scenes[1]).toMatchObject({type: 'feature', title: 'Eins', frames: 60, media: {kind: 'image', src: 'products/p/screens/one.png'}});
    expect(r.scenes[2]).toMatchObject({type: 'cta', text: 'Hol es', sub: ['B']});
    expect(r.durationInFrames).toBe(75 + 60 + 75);
  });

  it('applies format dimensions and layout class', () => {
    expect(resolveClip(content(), {lang: 'en', format: '16x9'})).toMatchObject({width: 1920, height: 1080, layout: 'landscape'});
    expect(resolveClip(content(), {lang: 'en', format: '1x1'})).toMatchObject({width: 1080, height: 1080, layout: 'square'});
  });

  it('prefers option theme over clip theme over brand default', () => {
    const c = content({clip: ClipSchema.parse({...content().clip, theme: 'light'})});
    expect(resolveClip(c, {lang: 'en', format: '9x16'}).themeName).toBe('light');
    expect(resolveClip(c, {lang: 'en', format: '9x16', theme: 'dark'}).themeName).toBe('dark');
  });

  it('lets a scene override feature text and highlight', () => {
    const c = content({
      clip: ClipSchema.parse({
        product: 'p',
        brand: 'b',
        formats: ['9x16'],
        scenes: [{type: 'feature', feature: 'one', title: 'Custom', highlight: {x: 1, y: 2}}],
      }),
    });
    expect(resolveClip(c, {lang: 'en', format: '9x16'}).scenes[0]).toMatchObject({title: 'Custom', highlight: {x: 1, y: 2}});
  });

  it('reports all problems at once', () => {
    const c = content({
      clip: ClipSchema.parse({
        product: 'p',
        brand: 'b',
        formats: ['9x16'],
        scenes: [
          {type: 'hook', text: {en: 'only english'}},
          {type: 'feature', feature: 'missing'},
          {type: 'cta', phase: 'nope'},
        ],
      }),
    });
    expect.assertions(4);
    try {
      resolveClip(c, {lang: 'de', format: '9x16'});
    } catch (e) {
      expect(e).toBeInstanceOf(ResolveError);
      const p = (e as ResolveError).problems.join('\n');
      expect(p).toContain('has no "de" text');
      expect(p).toContain('feature "missing" not found');
      expect(p).toContain('phase "nope" not found');
    }
  });

  it('rejects unknown languages and themes', () => {
    expect(() => resolveClip(content(), {lang: 'fr', format: '9x16'})).toThrow(/language "fr"/);
    expect(() => resolveClip(content(), {lang: 'en', format: '9x16', theme: 'neon'})).toThrow(/theme "neon"/);
  });

  it('enforces brand voice rules', () => {
    const long = content({
      clip: ClipSchema.parse({product: 'p', brand: 'b', formats: ['9x16'], scenes: [{type: 'hook', text: 'one two three four five'}]}),
    });
    expect(() => resolveClip(long, {lang: 'en', format: '9x16'})).toThrow(/5 words/);
    const banned = content({
      clip: ClipSchema.parse({product: 'p', brand: 'b', formats: ['9x16'], scenes: [{type: 'hook', text: 'Revolutionary app'}]}),
    });
    expect(() => resolveClip(banned, {lang: 'en', format: '9x16'})).toThrow(/banned word "revolutionary"/);
  });
});

describe('schemas', () => {
  it('requires exactly one of image or video per feature', () => {
    expect(ProductSchema.safeParse({name: 'P', langs: ['en'], features: {a: {title: 'A'}}}).success).toBe(false);
    expect(ProductSchema.safeParse({name: 'P', langs: ['en'], features: {a: {title: 'A', image: 'a.png', video: 'a.mp4'}}}).success).toBe(false);
    expect(ProductSchema.safeParse({name: 'P', langs: ['en'], features: {a: {title: 'A', video: 'a.mp4', from: 3}}}).success).toBe(true);
  });

  it('requires defaultTheme in themes', () => {
    expect(BrandSchema.safeParse({name: 'B', themes: ['dark'], defaultTheme: 'light', cta: {}}).success).toBe(false);
  });

  it('rejects invalid colors', () => {
    expect(ThemeSchema.safeParse({bg: ['red', '#000000'], text: '#ffffff', accent: '#ff0000'}).success).toBe(false);
  });
});

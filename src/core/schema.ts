import {z} from 'zod';
import {FORMAT_IDS, ICON_IDS, SET_IDS} from './ids';

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'expected #rrggbb');
const Id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'expected kebab-case id');

// plain string = same in every language, record = per language (all languages required)
export const TextSchema = z.union([z.string(), z.record(z.string(), z.string())]);
export type Text = z.infer<typeof TextSchema>;

export const HighlightSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  size: z.number().positive().optional(),
});

export const ThemeSchema = z.object({
  bg: z.tuple([Color, Color]),
  text: Color,
  accent: Color,
  ring: Color.optional(),
  frame: Color.optional(),
});
export type Theme = z.infer<typeof ThemeSchema>;

export const BrandSchema = z
  .object({
    name: z.string().min(1),
    logo: z.string().optional(),
    themes: z.array(Id).min(1),
    defaultTheme: Id,
    voice: z
      .object({
        maxHookWords: z.number().int().positive().optional(),
        banned: z.array(z.string()).optional(),
      })
      .optional(),
    cta: z.record(Id, z.object({text: TextSchema, sub: z.array(TextSchema).optional()})),
  })
  .refine((b) => b.themes.includes(b.defaultTheme), {message: 'defaultTheme must be listed in themes', path: ['defaultTheme']});
export type Brand = z.infer<typeof BrandSchema>;

export const FeatureSchema = z
  .object({
    title: TextSchema,
    subtitle: TextSchema.optional(),
    image: z.string().optional(),
    video: z.string().optional(),
    from: z.number().min(0).optional(),
    highlight: HighlightSchema.optional(),
    icon: z.enum(ICON_IDS).optional(),
    note: TextSchema.optional(),
  })
  .refine((f) => Boolean(f.image) !== Boolean(f.video), {message: 'set exactly one of image or video'});
export type Feature = z.infer<typeof FeatureSchema>;

export const ProductSchema = z.object({
  name: z.string().min(1),
  tagline: TextSchema.optional(),
  langs: z.array(z.string().min(2)).min(1),
  features: z.record(Id, FeatureSchema),
});
export type Product = z.infer<typeof ProductSchema>;

const Seconds = z.number().positive().optional();

export const SceneSchema = z.discriminatedUnion('type', [
  z.object({type: z.literal('hook'), text: TextSchema, seconds: Seconds}),
  z.object({
    type: z.literal('feature'),
    feature: Id,
    title: TextSchema.optional(),
    subtitle: TextSchema.optional(),
    highlight: HighlightSchema.optional(),
    icon: z.enum(ICON_IDS).optional(),
    note: TextSchema.optional(),
    seconds: Seconds,
  }),
  z.object({type: z.literal('stat'), value: TextSchema, label: TextSchema, seconds: Seconds}),
  z.object({type: z.literal('quote'), text: TextSchema, author: TextSchema.optional(), seconds: Seconds}),
  z.object({type: z.literal('ui-card'), kind: z.enum(['list', 'chat']).default('list'), title: TextSchema.optional(), items: z.array(TextSchema).min(1).max(6), seconds: Seconds}),
  z.object({type: z.literal('outro'), text: TextSchema.optional(), seconds: Seconds}),
  z.object({type: z.literal('cta'), phase: Id.optional(), text: TextSchema.optional(), sub: z.array(TextSchema).optional(), seconds: Seconds}),
]);
export type Scene = z.infer<typeof SceneSchema>;

export const ClipSchema = z.object({
  product: Id,
  brand: Id,
  theme: Id.optional(),
  set: z.enum(SET_IDS).default('gradient'),
  transition: z.enum(['none', 'fade', 'slide']).default('none'),
  formats: z.array(z.enum(FORMAT_IDS)).min(1),
  langs: z.array(z.string().min(2)).min(1).optional(),
  scenes: z.array(SceneSchema).min(1),
});
export type Clip = z.infer<typeof ClipSchema>;

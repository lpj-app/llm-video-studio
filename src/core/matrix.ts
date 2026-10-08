import {z} from 'zod';
import {FORMAT_IDS} from './ids';

// one job per clip; every omitted axis falls back to the clip defaults
export const MatrixSchema = z.object({
  jobs: z
    .array(
      z.object({
        clip: z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/, 'expected <product>/<clip>'),
        themes: z.array(z.string()).min(1).optional(),
        formats: z.array(z.enum(FORMAT_IDS)).min(1).optional(),
        langs: z.array(z.string()).min(1).optional(),
      }),
    )
    .min(1),
});
export type Matrix = z.infer<typeof MatrixSchema>;

// flags in the shape scripts/lib.ts variants() expects
export const jobFlags = (j: Matrix['jobs'][number]): Record<string, string[]> => {
  const f: Record<string, string[]> = {};
  if (j.themes) f.theme = j.themes;
  if (j.formats) f.format = j.formats;
  if (j.langs) f.lang = j.langs;
  return f;
};

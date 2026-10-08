import fs from 'node:fs/promises';
import path from 'node:path';
import {FORMAT_IDS, type FormatId} from '../src/core/ids';
import type {ReadJson} from '../src/core/load';
import type {Content} from '../src/core/resolve';

// content root: LVS_CONTENT or ./examples; also served as Remotion's public dir
export const contentRoot = () => path.resolve(process.env.LVS_CONTENT ?? 'examples');

export const fsReader =
  (root = contentRoot()): ReadJson =>
  async (p) =>
    JSON.parse((await fs.readFile(path.join(root, p), 'utf8')).replace(/^﻿/, ''));

export function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) flags[a.slice(2)] = (argv[++i] ?? '').split(',').filter(Boolean);
    else positional.push(a);
  }
  return {positional, flags};
}

export async function listClips(root = contentRoot()): Promise<string[]> {
  const out: string[] = [];
  const base = path.join(root, 'clips');
  for (const product of await fs.readdir(base)) {
    for (const f of await fs.readdir(path.join(base, product))) {
      if (f.endsWith('.json')) out.push(`${product}/${f.slice(0, -5)}`);
    }
  }
  return out.sort();
}

export type Variant = {theme: string; format: FormatId; lang: string};

export function variants(c: Content, flags: Record<string, string[]>, allThemes = false): Variant[] {
  const themes = flags.theme ?? (allThemes ? c.brand.themes : [c.clip.theme ?? c.brand.defaultTheme]);
  const formats = (flags.format ?? c.clip.formats) as FormatId[];
  const langs = flags.lang ?? c.clip.langs ?? c.product.langs;
  for (const f of formats) if (!FORMAT_IDS.includes(f)) throw new Error(`unknown format "${f}" (available: ${FORMAT_IDS.join(', ')})`);
  return themes.flatMap((theme) => formats.flatMap((format) => langs.map((lang) => ({theme, format, lang}))));
}

export const outName = (clipId: string, v: Variant) => `${clipId}__${v.theme}__${v.format}__${v.lang}`;

// optional: use an installed Chrome/Chromium instead of Remotion's own download
export const browserExecutable = process.env.LVS_BROWSER || undefined;

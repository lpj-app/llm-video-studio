import fs from 'node:fs/promises';
import path from 'node:path';
import {checkTheme} from '../src/core/contrast';
import {ThemeSchema} from '../src/core/schema';
import {contentRoot} from './lib';

// usage: npm run check-contrast   (all themes of all brands in the content root)
const base = path.join(contentRoot(), 'brands');
let failed = false;
for (const brand of await fs.readdir(base)) {
  const dir = path.join(base, brand, 'themes');
  for (const f of await fs.readdir(dir).catch(() => [])) {
    if (!f.endsWith('.json')) continue;
    const theme = ThemeSchema.parse(JSON.parse((await fs.readFile(path.join(dir, f), 'utf8')).replace(/^﻿/, '')));
    const problems = checkTheme(theme);
    if (problems.length) failed = true;
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${brand}/${f.slice(0, -5)}${problems.map((p) => `\n     ${p}`).join('')}`);
  }
}
process.exit(failed ? 1 : 0);

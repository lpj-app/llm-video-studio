import fs from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {loadContent} from '../src/core/load';
import {jobFlags, MatrixSchema} from '../src/core/matrix';
import {ResolveError, resolveClip} from '../src/core/resolve';
import {browserExecutable, chromiumOptions, contentRoot, fsReader, outName, parseArgs, variants} from './lib';

// usage: npm run matrix -- [matrix.json] [--dry] [--force]
//   matrix.json is read from the content root (default "matrix.json"); --dry lists the files, --force re-renders existing ones
const argv = process.argv.slice(2);
const dry = argv.includes('--dry');
const force = argv.includes('--force');
const {positional} = parseArgs(argv.filter((a) => a !== '--dry' && a !== '--force'));
const root = contentRoot();
const file = positional[0] ?? 'matrix.json';
const matrix = MatrixSchema.parse(JSON.parse((await fs.readFile(path.join(root, file), 'utf8')).replace(/^﻿/, '')));
const read = fsReader(root);

type Item = {clipId: string; v: ReturnType<typeof variants>[number]; output: string};
const items: Item[] = [];
const failures: string[] = [];
for (const job of matrix.jobs) {
  try {
    const content = await loadContent(read, job.clip);
    for (const v of variants(content, jobFlags(job))) {
      resolveClip(content, v); // fail early on content problems
      items.push({clipId: job.clip, v, output: path.join('out', `${outName(job.clip, v)}.mp4`)});
    }
  } catch (e) {
    failures.push(`${job.clip}: ${e instanceof ResolveError ? e.problems.join('; ') : (e as Error).message}`);
  }
}

const exists = (p: string) => fs.access(p).then(() => true, () => false);
const todo: Item[] = [];
for (const it of items) if (force || !(await exists(it.output))) todo.push(it);
console.log(`${items.length} files in matrix, ${items.length - todo.length} already rendered, ${todo.length} to render`);

if (dry) {
  for (const it of todo) console.log(it.output);
} else if (todo.length) {
  const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: root});
  const started = Date.now();
  for (const [n, it] of todo.entries()) {
    const label = `[${n + 1}/${todo.length}] ${it.output}`;
    try {
      const inputProps = {clip: it.clipId, ...it.v};
      const composition = await selectComposition({serveUrl, id: 'Video', inputProps, browserExecutable, chromiumOptions});
      await fs.mkdir(path.dirname(it.output), {recursive: true});
      const tmp = `${it.output}.part.mp4`;
      await renderMedia({composition, serveUrl, inputProps, codec: 'h264', outputLocation: tmp, browserExecutable, chromiumOptions});
      await fs.rename(tmp, it.output); // only complete files count as rendered
      const s = Math.round((Date.now() - started) / 1000);
      console.log(`${label} done (${s}s elapsed)`);
    } catch (e) {
      failures.push(`${it.output}: ${(e as Error).message.split('\n')[0]}`);
      console.error(`${label} FAILED`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `- ${f}`).join('\n')}`);
  process.exit(1);
}

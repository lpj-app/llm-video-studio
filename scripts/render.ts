import fs from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {loadContent} from '../src/core/load';
import {TRANSITION_FRAMES, type ResolvedClip} from '../src/core/resolve';
import {browserExecutable, chromiumOptions, contentRoot, fsReader, listClips, outName, parseArgs, variants} from './lib';

// usage: npm run render -- <product>/<clip>... [--theme a,b] [--format 9x16,16x9] [--lang en,de]
//        npm run sheet  -- <product>/<clip>...   (one still per scene, out/sheet/)
const mode = process.argv[2] === 'sheet' ? 'sheet' : 'render';
const {positional, flags} = parseArgs(process.argv.slice(mode === 'sheet' ? 3 : 2));
if (!positional.length) {
  console.error(`usage: npm run ${mode} -- <product>/<clip>... [--theme a,b] [--format 9x16,16x9] [--lang en,de]\navailable: ${(await listClips()).join(', ')}`);
  process.exit(1);
}

const root = contentRoot();
const read = fsReader(root);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: root});

for (const clipId of positional) {
  const content = await loadContent(read, clipId);
  for (const v of variants(content, flags)) {
    const inputProps = {clip: clipId, ...v};
    const composition = await selectComposition({serveUrl, id: 'Video', inputProps, browserExecutable, chromiumOptions});
    const name = outName(clipId, v);
    if (mode === 'render') {
      const output = path.join('out', `${name}.mp4`);
      await fs.mkdir(path.dirname(output), {recursive: true});
      let last = -1;
      await renderMedia({
        composition,
        serveUrl,
        inputProps,
        codec: 'h264',
        outputLocation: output,
        browserExecutable,
        chromiumOptions,
        onProgress: ({progress}) => {
          const pct = Math.floor(progress * 10) * 10;
          if (pct !== last) process.stdout.write(`\r${name}: ${(last = pct)}%`);
        },
      });
      console.log(`\n${output}`);
    } else {
      let start = 0;
      const {scenes, transition} = (composition.props as {resolved: ResolvedClip}).resolved;
      const overlap = transition === 'none' ? 0 : TRANSITION_FRAMES;
      for (const [i, s] of scenes.entries()) {
        const output = path.join('out', 'sheet', `${name}__${String(i + 1).padStart(2, '0')}.png`);
        await fs.mkdir(path.dirname(output), {recursive: true});
        await renderStill({composition, serveUrl, inputProps, frame: start + Math.floor(s.frames * 0.7), output, browserExecutable, chromiumOptions});
        start += s.frames - overlap;
        console.log(output);
      }
    }
  }
}

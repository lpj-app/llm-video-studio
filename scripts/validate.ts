import {loadContent} from '../src/core/load';
import {ResolveError, resolveClip} from '../src/core/resolve';
import {fsReader, listClips, parseArgs, variants} from './lib';

const {positional, flags} = parseArgs(process.argv.slice(2));
const ids = positional.length ? positional : await listClips();
const read = fsReader();
let count = 0;
let failed = false;

for (const id of ids) {
  try {
    const content = await loadContent(read, id);
    for (const v of variants(content, flags, true)) {
      resolveClip(content, v);
      count++;
    }
  } catch (e) {
    failed = true;
    console.error(e instanceof ResolveError ? e.problems.join('\n') : e);
  }
}

console.log(failed ? 'validation failed' : `ok: ${ids.length} clips, ${count} variants`);
process.exit(failed ? 1 : 0);

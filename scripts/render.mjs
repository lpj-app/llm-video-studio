import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const names = process.argv.slice(2);
if (!names.length) {
  console.error('usage: npm run render <video-name> [more names...]');
  process.exit(1);
}

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const name of names) {
  const inputProps = {video: name};
  const composition = await selectComposition({serveUrl, id: 'Ad', inputProps});
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    codec: 'h264',
    outputLocation: `out/${name}.mp4`,
    onProgress: ({progress}) => process.stdout.write(`\r${name}: ${Math.round(progress * 100)}%`),
  });
  console.log(`\nout/${name}.mp4`);
}

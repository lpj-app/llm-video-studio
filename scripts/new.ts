import fs from 'node:fs/promises';
import path from 'node:path';
import {contentRoot, parseArgs} from './lib';

// usage: npm run new -- brand <id> | theme <brand> <id> | product <id> | clip <product>/<id> --brand <brand>
const [kind, ...rest] = parseArgs(process.argv.slice(2)).positional;
const {flags} = parseArgs(process.argv.slice(2));
const root = contentRoot();
const write = async (p: string, data: unknown) => {
  const file = path.join(root, p);
  await fs.mkdir(path.dirname(file), {recursive: true});
  try {
    await fs.access(file);
    throw new Error(`${p} exists`);
  } catch (e) {
    if ((e as Error).message.endsWith('exists')) throw e;
  }
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(p);
};
const theme = {bg: ['#0f172a', '#1e1b4b'], text: '#ffffff', accent: '#facc15'};

if (kind === 'brand' && rest[0]) {
  await write(`brands/${rest[0]}/brand.json`, {name: rest[0], themes: ['dark'], defaultTheme: 'dark', voice: {maxHookWords: 6, banned: []}, cta: {launch: {text: 'Get it now', sub: [rest[0]]}}});
  await write(`brands/${rest[0]}/themes/dark.json`, theme);
} else if (kind === 'theme' && rest[1]) {
  await write(`brands/${rest[0]}/themes/${rest[1]}.json`, theme);
  console.log(`add "${rest[1]}" to themes in brands/${rest[0]}/brand.json, then npm run check-contrast`);
} else if (kind === 'product' && rest[0]) {
  await write(`products/${rest[0]}/product.json`, {name: rest[0], langs: ['en'], features: {}});
} else if (kind === 'clip' && rest[0]?.includes('/') && flags.brand?.[0]) {
  const [product, id] = rest[0].split('/');
  await write(`clips/${product}/${id}.json`, {product, brand: flags.brand[0], formats: ['9x16'], scenes: [{type: 'hook', text: 'Your hook here'}, {type: 'cta', phase: 'launch'}]});
} else {
  console.error('usage: npm run new -- brand <id> | theme <brand> <id> | product <id> | clip <product>/<id> --brand <brand>');
  process.exit(1);
}

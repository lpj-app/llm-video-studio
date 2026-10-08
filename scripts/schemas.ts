import fs from 'node:fs/promises';
import {z} from 'zod';
import {BrandSchema, ClipSchema, ProductSchema, ThemeSchema} from '../src/core/schema';

// writes JSON Schemas for editor autocomplete: npm run schemas
await fs.mkdir('schemas', {recursive: true});
for (const [name, schema] of Object.entries({brand: BrandSchema, theme: ThemeSchema, product: ProductSchema, clip: ClipSchema})) {
  await fs.writeFile(`schemas/${name}.schema.json`, JSON.stringify(z.toJSONSchema(schema), null, 2) + '\n');
  console.log(`schemas/${name}.schema.json`);
}

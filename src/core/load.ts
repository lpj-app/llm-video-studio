import type {z} from 'zod';
import {BrandSchema, ClipSchema, ProductSchema, ThemeSchema} from './schema';
import {ResolveError, type Content} from './resolve';

// reads a JSON file relative to the content root (fs in Node, fetch in the browser)
export type ReadJson = (path: string) => Promise<unknown>;

async function parse<T extends z.ZodType>(read: ReadJson, path: string, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await read(path);
  } catch (e) {
    throw new ResolveError([`${path}: ${e instanceof Error ? e.message : String(e)}`]);
  }
  const res = schema.safeParse(raw);
  if (!res.success) throw new ResolveError(res.error.issues.map((i) => `${path}: ${i.path.join('.') || '(root)'}: ${i.message}`));
  return res.data;
}

export async function loadContent(read: ReadJson, clipId: string): Promise<Content> {
  const [productId, name] = clipId.split('/');
  if (!productId || !name) throw new ResolveError([`clip id must look like "<product>/<clip>", got "${clipId}"`]);
  const clip = await parse(read, `clips/${productId}/${name}.json`, ClipSchema);
  const brand = await parse(read, `brands/${clip.brand}/brand.json`, BrandSchema);
  const product = await parse(read, `products/${clip.product}/product.json`, ProductSchema);
  const themes = Object.fromEntries(
    await Promise.all(brand.themes.map(async (t) => [t, await parse(read, `brands/${clip.brand}/themes/${t}.json`, ThemeSchema)] as const)),
  );
  return {clipId, clip, brand, product, themes};
}

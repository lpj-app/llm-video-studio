# llm-video-studio

Data-driven video studio for product clips. Products, brands, themes and clips are JSON; the engine renders every combination in vertical, square and landscape formats and in every language. Built on [Remotion](https://www.remotion.dev/), written to be driven by an LLM (see `CLAUDE.md`).

## Usage

```bash
npm install
npm run validate                                   # check all content
npm run studio                                     # live preview
npm run sheet  -- habits/launch                    # one still per scene -> out/sheet/
npm run render -- habits/launch                    # clip defaults
npm run render -- habits/launch --theme dark,light --format 9x16,16x9 --lang en,de
```

Output: `out/<product>/<clip>__<theme>__<format>__<lang>.mp4`. Formats: `9x16`, `4x5`, `1x1`, `16x9`.

Remotion downloads a headless Chrome on first render. To use an installed browser set `LVS_BROWSER` to its executable.

## Content

The content root is `LVS_CONTENT` (default `./examples`) and is served as Remotion's public dir. Keep real products in a separate private repo and point `LVS_CONTENT` at it.

```
<content>/
  brands/<brand>/brand.json            name, logo, themes, voice rules, CTA phrases
  brands/<brand>/themes/<theme>.json   bg, text, accent, ring, frame
  brands/<brand>/assets/
  products/<product>/product.json      languages, feature catalogue
  products/<product>/screens/
  clips/<product>/<clip>.json          brand, theme, set, formats, langs, scenes
```

Texts are a string (all languages) or `{"en": "...", "de": "..."}` (every enabled language required). Clips reference product features by id; a scene may override title, subtitle and highlight. Values resolve in this order: brand and theme, product feature, scene override; `--theme` beats the clip theme beats the brand default.

`npm run schemas` writes JSON Schemas to `schemas/` for editor autocomplete.

## Code

```
src/core/      schemas (zod), resolver, content loader
src/formats.ts format registry (size, layout class, safe zones)
src/layout.ts  positions per layout class
src/scenes/    scene registry (hook, feature, cta)
src/sets/      stage registry (gradient)
scripts/       render, sheet, validate, studio, schemas
test/          vitest
```

New scene type: add it to `SceneSchema` and `resolveClip`, then to `src/scenes/index.tsx`. New set: add the id to `SET_IDS` and a stage to `src/sets/`. New format: add it to `FORMAT_IDS` and `FORMATS`.

## License

Remotion is free for individuals, for-profit companies up to three people and non-profits; larger companies need a company license. Check the current terms before commercial use: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md. Inter is licensed under the OFL.

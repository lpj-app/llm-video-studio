# llm-video-studio

Data-driven video studio for product clips. Products, brands, themes and clips are JSON; the engine renders every combination in vertical, square and landscape formats and in every language. Built on [Remotion](https://www.remotion.dev/), written to be driven by an LLM (see `CLAUDE.md`).

## Setup

Requires Node.js 22.

```bash
git clone <engine repo> && cd llm-video-studio
npm install
```

The engine ships a fictional demo brand in `examples/`, so every command works right after install. For real products keep the content in its own repo (see Content) and point `LVS_CONTENT` at it:

```bash
export LVS_CONTENT=../my-content          # bash, current shell
$env:LVS_CONTENT = "../my-content"        # PowerShell, current window
setx LVS_CONTENT "C:\path\to\my-content"  # Windows, permanent (open a new terminal)
```

Remotion downloads a headless Chrome on first render. To use an installed browser set `LVS_BROWSER` to its executable.

## Workflow: new clip

1. Make sure the brand, theme and product exist. Otherwise scaffold them: `npm run new -- brand <id>`, `theme <brand> <id>`, `product <id>`. Add features and screens to `product.json`.
2. `npm run new -- clip <product>/<clip> --brand <brand>`, then edit `clips/<product>/<clip>.json`: pick a `set`, the `formats`, and the `scenes` (hook, features by id, cta).
3. `npm run validate` (references, languages, hook length, banned words) and `npm run check-contrast` (themes).
4. `npm run sheet -- <product>/<clip>`: one still per scene in `out/sheet/`. Look at them, fix, repeat. `npm run studio` gives a live preview.
5. `npm run render -- <product>/<clip>`: MP4 files in `out/`.

With Claude Code: start `claude` in the engine folder (add the content repo with `--add-dir`) and describe the clip. `CLAUDE.md` and the skills in `.claude/skills/` (`new-clip`, `new-brand`, `new-theme`, `review-clip`) run steps 1-4 for you.

## Commands

| Command | Does |
|---|---|
| `npm run validate [clip...]` | check all or given clips in every theme, format and language |
| `npm run lint-copy` | alias of `validate` (copy rules from the brand voice) |
| `npm run check-contrast` | WCAG check of all themes (text 4.5:1, accent and ring 3:1) |
| `npm run new -- brand\|theme\|product\|clip ...` | scaffold content files |
| `npm run sheet -- <product>/<clip>` | one still per scene |
| `npm run studio` | live preview in the browser |
| `npm run render -- <product>/<clip>` | render the clip defaults |
| `npm run schemas` | write JSON Schemas to `schemas/` for editor autocomplete |
| `npm run typecheck`, `npm test` | code checks |

Flags for `render` and `sheet`: `--theme a,b`, `--format 9x16,16x9`, `--lang en,de`. One call renders every combination, for example `npm run render -- habits/launch --theme dark,light --format 9x16,16x9 --lang en,de`.

Output: `out/<product>/<clip>__<theme>__<format>__<lang>.mp4`. Formats: `9x16`, `4x5`, `1x1`, `16x9`.

## Content

The content root is `LVS_CONTENT` (default `./examples`) and is served as Remotion's public dir. Keep real products in a separate private repo and point `LVS_CONTENT` at it. This keeps customer data out of this public repo and lets you update the engine with a plain `git pull`. If you prefer one repo, fork the engine privately, put the content in a `content/` folder and change the default in `scripts/lib.ts`.

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


## Code

```
src/core/      schemas (zod), resolver, content loader
src/formats.ts format registry (size, layout class, safe zones)
src/layout.ts  positions per layout class
src/scenes/    scene registry (hook, feature, stat, quote, ui-card, outro, cta)
src/sets/      set registry: stage + look switches (gradient, grid)
src/components/ glass icon, note, icon set
scripts/       render, sheet, validate, studio, schemas
tests/         vitest
```

New scene type: add it to `SceneSchema` and `resolveClip`, then to `src/scenes/index.tsx`. New set: add the id to `SET_IDS` and a stage to `src/sets/`. New format: add it to `FORMAT_IDS` and `FORMATS`.

## Scenes and transitions

| Scene | Fields |
|---|---|
| `hook` | `text` |
| `feature` | `feature` (id), optional `title`, `subtitle`, `highlight`, `icon`, `note` |
| `stat` | `value`, `label` |
| `quote` | `text`, optional `author` |
| `ui-card` | `kind` (`list` or `chat`), optional `title`, `items` (1-6): a card built from theme tokens, no screenshot |
| `outro` | optional `text`; logo and brand name |
| `cta` | `phase` (from the brand) or `text`, optional `sub` |

All scenes take optional `seconds`. Texts follow the language rules above and the brand's banned words. `"transition": "fade"` or `"slide"` on the clip overlaps scenes by 12 frames (the clip gets shorter by that overlap); default is `none`. See `examples/clips/habits/showcase.json`.

## Sets

- `gradient`: gradient stage, tilted phone, highlight ring.
- `grid`: calm perspective grid floor with soft orbs, floating glass icon (`icon`), hand-written note (`note`), blur-in scenes. Details and render cost: `docs/look-grid.md`.

Select a set with `"set"` in the clip file. A feature can carry `icon` and `note`; scenes may override both.

## License

Remotion is free for individuals, for-profit companies up to three people and non-profits; larger companies need a company license. Check the current terms before commercial use: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md. Inter is licensed under the OFL.

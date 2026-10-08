# llm-video-studio

Data-driven Remotion studio. Content is JSON (see `README.md`), code is generic. Do not write per-clip code.

## New clip

1. Ask first if unclear: product, audience, hook, language(s), theme, formats.
2. Reuse existing brand and product files. Add missing features to `products/<id>/product.json`, assets next to it.
3. Write `clips/<product>/<name>.json`, reference features by id.
4. `npm run validate`, fix every reported problem.
5. `npm run sheet -- <product>/<clip>`, look at the PNGs in `out/sheet/` for every format, fix text wrapping and highlight positions.
6. `npm run render -- <product>/<clip>`, report the output paths.

## Copy rules

- Video is silent: everything must be readable.
- Hook: max 8 words (brand `voice.maxHookWords`), a problem or question, lands in 1.5 s.
- Feature titles: benefit, max ~5 words. Subtitle optional, max ~6 words. One feature per scene, 3 to 5 scenes plus CTA.
- Follow the brand's tone; `voice.banned` words are rejected by validate.
- Screens: filled data, fictional names, same device and theme. Never use real personal data.

## Code rules

- `src/core` has no React and no Node APIs (it runs in Node and in the browser).
- Layout numbers live in `src/layout.ts`, formats in `src/formats.ts`. Scenes must not hardcode pixel positions for one format.
- Run `npm run typecheck` and `npm test` before committing.
- Commits: conventional commits, one short subject line, no body, no co-author lines.

---
name: new-clip
description: Create a new clip from product features. Ask first, then write the clip JSON and review stills.
---
1. Ask once: product, audience, hook, languages, theme, set, formats. Use defaults for anything not answered.
2. `npm run new -- clip <product>/<id> --brand <brand>`, then fill `scenes` with feature ids from the product (see `products/<product>/product.json`).
3. Hook within the brand's `maxHookWords`; titles are benefits, max 5 words; all enabled languages for every text.
4. `npm run lint-copy`, then `npm run sheet -- <product>/<id>`, look at every still, fix, repeat.
5. Render only on request: `npm run render -- <product>/<id>`.

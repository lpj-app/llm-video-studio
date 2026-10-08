---
name: new-theme
description: Add a color theme to an existing brand and check contrast.
---
1. Ask once: brand, theme id, base colors (sample from the product or website).
2. `npm run new -- theme <brand> <id>`, edit the colors, add the id to `themes` in `brand.json`.
3. `npm run check-contrast` must pass (text 4.5:1, accent and ring 3:1 on both background stops).
4. `npm run sheet -- <product>/<clip> --theme <id>` and review.

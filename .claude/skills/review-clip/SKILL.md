---
name: review-clip
description: Review a clip with stills in every format and language, then report concrete fixes.
---
1. `npm run validate -- <product>/<clip>` and `npm run check-contrast`.
2. `npm run sheet -- <product>/<clip>` for all formats and languages; open each PNG.
3. Check: text inside safe zones, nothing clipped, highlight on the named element, hook lands in 1.5 s, no real names or data in screens.
4. Report findings as a list with file and field; fix only when asked.

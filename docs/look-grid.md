# Look: grid

Set id `grid`. Original design, pure CSS and SVG, no WebGL.

- Stage: perspective grid floor in the theme accent that scrolls toward the camera, soft drifting orbs and a glow along the horizon (no rays, no sparks: calm, clean look).
- Objects: frosted glass tile with a line icon (`icon` on a feature) that floats and tilts, step counter below it.
- Annotation: hand-written note with a drawn arrow (`note` on a feature), font Caveat.
- Motion: scenes enter with a soft blur and lift and leave with a fade; the phone tilts with a slow sway; highlight ring pulses.
- Layout: portrait and square put the tile at the right edge of the phone, landscape puts it above the title in the left column.
- Colors only from the theme (`bg`, `accent`, `ring`, `text`).

Icons: heart, calendar, map, cards, sparkles, check, list, star, bell, chat, home, users, lock (`src/components/icons.tsx`).

Cost: heavier than `gradient`. Measured on 2 CPU cores: about 0.45 s per frame at 1080x1920 (a 23 s clip renders in about 5 minutes). Avoid `backdrop-filter` and `filter: blur` on large areas.

Not included: true 3D objects (`@remotion/three`, `.glb` models). Add as a separate set if needed.

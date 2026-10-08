# Look: grid3d

Set id `grid3d`. Real 3D with three.js through `@remotion/three`.

- Stage: perspective grid floor (flat strips, scrolls toward the camera), fog, soft glow on the horizon, three small metallic shapes (torus, octahedron, sphere) floating near the top edge, slow camera drift. Colors from the theme (`accent`, `ring`, `bg`).
- Scenes, glass icon, notes and transitions work as in `grid`.
- Shapes are plain three.js geometry. Custom `.glb` models are not supported yet.

Rendering needs WebGL. Remotion's default usually works; if the render fails or is black set `LVS_GL` to `angle` (works with headless Chrome in containers and on most machines) or `swangle` (software, slower). Example: `$env:LVS_GL = "angle"`.

Cost: about 0.4 s per frame at 1080x1920 on 2 CPU cores, similar to `grid` (a 16 s clip takes about 3 minutes). Use `grid` for quick drafts.

import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useMemo} from 'react';
import {ExtrudeGeometry, Shape} from 'three';
import type {ResolvedClip} from '../core/resolve';
import {TRANSITION_FRAMES} from '../core/resolve';
import type {Theme} from '../core/schema';

// hearts floating at the edges: x in half-widths, y, depth, size
const HEARTS = [
  {x: -1.2, y: 4.6, z: -11, s: 1.0},
  {x: 1.25, y: 5.6, z: -13, s: 0.6},
  {x: 1.3, y: 2.9, z: -9, s: 0.4},
  {x: -1.3, y: 2.4, z: -8, s: 0.35},
  {x: 1.0, y: 7.6, z: -15, s: 0.9},
] as const;

// extruded heart with a soft bevel, centered, point down
const makeHeart = () => {
  const sh = new Shape();
  sh.moveTo(0.25, 0.25);
  sh.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0);
  sh.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35);
  sh.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95);
  sh.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35);
  sh.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0);
  sh.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25);
  const g = new ExtrudeGeometry(sh, {depth: 0.18, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 6, curveSegments: 24});
  g.center();
  g.scale(1.15, -1.15, 1.15); // heart tip down
  return g;
};

// floor lines as thin flat strips (WebGL lines stay 1px wide and vanish at 1080p)
const LINES = Array.from({length: 41}, (_, i) => (i - 20) * 2);
const ROWS = Array.from({length: 30}, (_, i) => i * 2);
const Floor: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.09) % 2;
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {LINES.map((x) => (
        <mesh key={`v${x}`} position={[x, 30, 0]}>
          <planeGeometry args={[0.05, 60]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} fog />
        </mesh>
      ))}
      {ROWS.map((z) => (
        <mesh key={`h${z}`} position={[0, z - shift, 0]}>
          <planeGeometry args={[80, 0.05]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} fog />
        </mesh>
      ))}
    </group>
  );
};

// camera pose per scene; the camera glides from one pose to the next at every scene change
const POSES = [
  {x: 0, y: 2.6, z: 3, yaw: 0},
  {x: -0.5, y: 3.1, z: 2.2, yaw: 0.05},
  {x: 0.5, y: 2.3, z: 2.6, yaw: -0.05},
  {x: -0.4, y: 3.4, z: 1.8, yaw: 0.04},
  {x: 0.4, y: 2.5, z: 2.4, yaw: -0.04},
];
const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

const Rig: React.FC<{clip: ResolvedClip}> = ({clip}) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const overlap = clip.transition === 'none' ? 0 : TRANSITION_FRAMES;
  let start = 0;
  const pose = {...POSES[0]};
  clip.scenes.forEach((sc, i) => {
    if (i > 0) {
      const u = smooth((frame - (start - 8)) / 40);
      const a = POSES[(i - 1) % POSES.length];
      const b = POSES[i % POSES.length];
      pose.x += u * (b.x - a.x);
      pose.y += u * (b.y - a.y);
      pose.z += u * (b.z - a.z);
      pose.yaw += u * (b.yaw - a.yaw);
    }
    start += sc.frames - overlap;
  });
  camera.position.set(pose.x + Math.sin(frame / 90) * 0.3, pose.y + Math.sin(frame / 70) * 0.12, pose.z);
  camera.rotation.set(-0.2, pose.yaw, 0);
  return null;
};

const Heart: React.FC<{i: number; spread: number; color: string; alt: string}> = ({i, spread, color, alt}) => {
  const frame = useCurrentFrame();
  const geometry = useMemo(makeHeart, []);
  const h = HEARTS[i];
  const col = i % 2 ? alt : color;
  return (
    <mesh
      geometry={geometry}
      position={[h.x * spread, h.y + Math.sin(frame / (34 + i * 7) + i) * 0.35, h.z]}
      rotation={[0.1, Math.sin(frame / (40 + i * 9) + i) * 0.9, Math.sin(frame / 55 + i) * 0.18]}
      scale={h.s}
    >
      <meshStandardMaterial color={col} metalness={0.35} roughness={0.28} emissive={col} emissiveIntensity={0.14} />
    </mesh>
  );
};

const World: React.FC<{theme: Theme; spread: number; clip: ResolvedClip}> = ({theme, spread, clip}) => {
  const alt = theme.ring ?? theme.accent;
  return (
    <>
      <Rig clip={clip} />
      <fog attach="fog" args={[theme.bg[1], 12, 42]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.4} />
      <pointLight position={[0, 4, -6]} intensity={60} color={theme.accent} />
      <Floor color={theme.accent} />
      {HEARTS.map((_, i) => (
        <Heart key={i} i={i} spread={spread} color={theme.accent} alt={alt} />
      ))}
    </>
  );
};

// real 3D stage: grid floor in perspective plus floating metallic shapes, built with three.js
export const Grid3dStage: React.FC<{theme: Theme; clip: ResolvedClip}> = ({theme, clip}) => {
  const {width, height} = clip;
  const aspect = width / height;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.bg[0]}, ${theme.bg[1]})`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 25% at 50% 48%, ${theme.accent}55, transparent 70%)`}} />
      <ThreeCanvas width={width} height={height} camera={{position: [0, 2.6, 3], fov: aspect < 1 ? 62 : 48, near: 0.1, far: 80, rotation: [-0.2, 0, 0]}}>
        <World theme={theme} spread={aspect < 1 ? 3.1 : 8.5} clip={clip} />
      </ThreeCanvas>
    </>
  );
};

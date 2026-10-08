import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ResolvedClip} from '../core/resolve';
import {TRANSITION_FRAMES} from '../core/resolve';
import type {Theme} from '../core/schema';

// shapes floating at the edges, kept small and far so the content stays readable
const SHAPES = [
  {kind: 'torus', x: -1.25, y: 5.2, z: -14, s: 0.7},
  {kind: 'octa', x: 1.25, y: 6.4, z: -16, s: 0.6},
  {kind: 'sphere', x: 1.3, y: 3.4, z: -12, s: 0.4},
] as const;

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

const Shape: React.FC<{i: number; spread: number; color: string; alt: string}> = ({i, spread, color, alt}) => {
  const frame = useCurrentFrame();
  const sh = SHAPES[i];
  const col = i % 2 ? alt : color;
  return (
    <mesh
      position={[sh.x * spread, sh.y + Math.sin(frame / (34 + i * 7) + i) * 0.35, sh.z]}
      rotation={[frame * 0.014 * (i + 1), frame * 0.022, i]}
      scale={sh.s}
    >
      {sh.kind === 'torus' ? <torusGeometry args={[1, 0.34, 24, 48]} /> : sh.kind === 'octa' ? <octahedronGeometry args={[1, 0]} /> : <sphereGeometry args={[1, 32, 24]} />}
      <meshStandardMaterial color={col} metalness={0.55} roughness={0.22} emissive={col} emissiveIntensity={0.1} />
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
      {SHAPES.map((_, i) => (
        <Shape key={i} i={i} spread={spread} color={theme.accent} alt={alt} />
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

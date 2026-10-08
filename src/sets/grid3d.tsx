import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {ResolvedClip} from '../core/resolve';
import type {Theme} from '../core/schema';

// shapes floating at the edges, kept small and far so the content stays readable
const SHAPES = [
  {kind: 'torus', x: -1.0, y: 6.8, z: -14, s: 0.9},
  {kind: 'octa', x: 1.0, y: 8.2, z: -17, s: 0.8},
  {kind: 'sphere', x: 1.05, y: 4.6, z: -13, s: 0.5},
] as const;

// floor lines as thin flat strips (WebGL lines stay 1px wide and vanish at 1080p)
const LINES = Array.from({length: 41}, (_, i) => (i - 20) * 2);
const ROWS = Array.from({length: 30}, (_, i) => i * 2);
const Floor: React.FC<{color: string}> = ({color}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.06) % 2;
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

const Shape: React.FC<{i: number; spread: number; color: string; alt: string}> = ({i, spread, color, alt}) => {
  const frame = useCurrentFrame();
  const sh = SHAPES[i];
  const col = i % 2 ? alt : color;
  return (
    <mesh
      position={[sh.x * spread, sh.y + Math.sin(frame / (34 + i * 7) + i) * 0.35, sh.z]}
      rotation={[frame * 0.011 * (i + 1), frame * 0.017, i]}
      scale={sh.s}
    >
      {sh.kind === 'torus' ? <torusGeometry args={[1, 0.34, 24, 48]} /> : sh.kind === 'octa' ? <octahedronGeometry args={[1, 0]} /> : <sphereGeometry args={[1, 32, 24]} />}
      <meshStandardMaterial color={col} metalness={0.55} roughness={0.22} emissive={col} emissiveIntensity={0.1} />
    </mesh>
  );
};

const World: React.FC<{theme: Theme; spread: number}> = ({theme, spread}) => {
  const alt = theme.ring ?? theme.accent;
  return (
    <>
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
  const frame = useCurrentFrame();
  const {width, height} = clip;
  const aspect = width / height;
  const drift = Math.sin(frame / 90) * 0.4;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.bg[0]}, ${theme.bg[1]})`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 25% at 50% 48%, ${theme.accent}55, transparent 70%)`}} />
      <ThreeCanvas width={width} height={height} camera={{position: [drift, 2.6, 3], fov: aspect < 1 ? 62 : 48, near: 0.1, far: 80, rotation: [-0.2, 0, 0]}}>
        <World theme={theme} spread={aspect < 1 ? 3.1 : 8.5} />
      </ThreeCanvas>
    </>
  );
};

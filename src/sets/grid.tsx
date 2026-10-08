import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import type {ResolvedClip} from '../core/resolve';
import type {Theme} from '../core/schema';

const ORBS = [
  {x: 0.14, y: 0.22, r: 0.2, k: 0},
  {x: 0.88, y: 0.3, r: 0.15, k: 1},
  {x: 0.72, y: 0.78, r: 0.22, k: 2},
  {x: 0.18, y: 0.82, r: 0.17, k: 3},
];

// perspective grid floor, light rays, soft orbs and sparks; everything moves with the global frame
export const GridStage: React.FC<{theme: Theme; clip: ResolvedClip}> = ({theme, clip}) => {
  const frame = useCurrentFrame();
  const {width: w, height: h, layout} = clip;
  const u = Math.min(w, h);
  const horizon = h * (layout === 'landscape' ? 0.5 : 0.47);
  const cell = u * 0.1;
  const scroll = (frame * 1.8) % cell;
  const line = `${theme.accent}8c`;
  const drift = (i: number, a: number) => Math.sin(frame / (46 + i * 13) + i * 2) * a;
  return (
    <>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.bg[0]}, ${theme.bg[1]})`}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 28% at 50% ${horizon}px, ${theme.accent}66, transparent 70%)`}} />
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.12}deg at 50% ${horizon * 0.55}px, ${theme.accent}26 0deg 5deg, transparent 5deg 22deg)`,
          WebkitMaskImage: `radial-gradient(circle at 50% ${horizon * 0.55}px, #000, transparent 72%)`,
        }}
      />
      {ORBS.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: o.x * w - (o.r * u) / 2 + drift(i, u * 0.03),
            top: o.y * h - (o.r * u) / 2 + drift(i + 3, u * 0.025),
            width: o.r * u,
            height: o.r * u,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i % 2 ? theme.ring ?? theme.accent : theme.accent}55, transparent 68%)`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: horizon,
          width: w,
          height: h - horizon,
          overflow: 'hidden',
          perspective: u * 0.55,
          perspectiveOrigin: '50% 0%',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 35%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: -w,
            top: 0,
            width: w * 3,
            height: h * 1.8,
            transformOrigin: '50% 0%',
            transform: 'rotateX(74deg)',
            backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `0 ${scroll}px`,
          }}
        />
      </div>
      {Array.from({length: 16}, (_, i) => {
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(frame / (20 + random(`t${i}`) * 30) + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: random(`x${i}`) * w,
              top: random(`y${i}`) * h * 0.9 - ((frame * (0.2 + random(`s${i}`) * 0.4)) % (h * 0.1)),
              width: 4 + random(`r${i}`) * 6,
              height: 4 + random(`r${i}`) * 6,
              borderRadius: '50%',
              background: '#fff',
              opacity: tw * 0.55,
            }}
          />
        );
      })}
    </>
  );
};

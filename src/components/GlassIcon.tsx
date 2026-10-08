import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {IconId} from '../core/ids';
import {Icon} from './icons';

// frosted glass tile with a floating line icon
export const GlassIcon: React.FC<{icon: IconId; size: number; accent: string; delay?: number}> = ({icon, size, accent, delay = 8}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 110}});
  const float = Math.sin(frame / 18) * size * 0.05;
  const tilt = Math.sin(frame / 31) * 4 + interpolate(s, [0, 1], [-18, 0]);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        position: 'relative',
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${float}px) rotate(${tilt}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`,
        background: `linear-gradient(145deg, rgba(255,255,255,.42), rgba(255,255,255,.08) 55%, ${accent}33)`,
        border: '2px solid rgba(255,255,255,.5)',
        boxShadow: `0 ${size * 0.18}px ${size * 0.35}px rgba(0,0,0,.35), 0 0 ${size * 0.5}px ${accent}55, inset 0 2px 0 rgba(255,255,255,.65), inset 0 -${size * 0.08}px ${size * 0.16}px ${accent}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{position: 'absolute', left: size * 0.12, top: size * 0.08, width: size * 0.5, height: size * 0.22, borderRadius: size, background: 'linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0))', transform: 'rotate(-12deg)'}} />
      <div style={{filter: `drop-shadow(0 0 ${size * 0.08}px ${accent})`}}>
        <Icon id={icon} size={size * 0.52} color="#ffffff" stroke={1.600} />
      </div>
    </div>
  );
};

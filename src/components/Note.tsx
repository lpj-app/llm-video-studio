import {interpolate, useCurrentFrame} from 'remotion';
import {handFamily} from '../fonts';

// hand-written note with a drawn arrow; arrow points down-right (dir 1) or right (dir 0)
export const Note: React.FC<{text: string; size: number; color: string; delay?: number; arrow?: 'down' | 'right'}> = ({text, size, color, delay = 20, arrow = 'down'}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - delay, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const draw = interpolate(frame - delay - 8, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const w = size * 1.9;
  const d = arrow === 'down' ? 'M6 8 C 30 6, 56 20, 66 52' : 'M4 36 C 30 8, 70 8, 96 30';
  const head = arrow === 'down' ? 'M54 44 L66 54 L72 38' : 'M84 16 L98 30 L80 38';
  const len = 200;
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: size * 0.2, transform: 'rotate(-4deg)', opacity: t, fontFamily: handFamily, color}}>
      <span style={{fontSize: size, fontWeight: 700, lineHeight: 1, transform: `translateY(${(1 - t) * 14}px)`, display: 'inline-block'}}>{text}</span>
      <svg width={w} height={size * 1.1} viewBox="0 0 100 60" fill="none" stroke={color} strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round" style={{overflow: 'visible'}}>
        <path d={d} strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />
        <path d={head} strokeDasharray={60} strokeDashoffset={60 * (1 - Math.max(0, (draw - 0.7) / 0.3))} />
      </svg>
    </div>
  );
};
